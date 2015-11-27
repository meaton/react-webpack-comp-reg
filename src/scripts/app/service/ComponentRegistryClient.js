var clone = require('clone');

var log = require('loglevel');

//JSONIX
var Jsonix = require('jsonix').Jsonix;
var CMD = require('../../../mappings/Component').Component;
var context = new Jsonix.Context([CMD]);
var marshaller = context.createMarshaller();

var Constants = require("../constants");
var Config = require('../../config').Config;
var restUrl = require('../../config').restUrl;
var authUrl = restUrl + "/authentication";
var ccrUrl = require('../../config').ccrUrl;

var Validation = require('./Validation');

var ComponentSpec = require('../service/ComponentSpec');

var corsRequestParams = (Config.cors) ?
  { username: Config.REST.auth.username,
    password: Config.REST.auth.password,
    xhrFields: {
      withCredentials: true
  }} : {};

var ComponentRegistryClient = {

  loadComponents: function(type, space, handleSuccess, handleFailure) {
    var type = (type != null) ? type.toLowerCase() : "profiles";
    var requestUrl = restUrl + '/registry/' + type;
    $.ajax($.extend({
     url: requestUrl,
     accepts: {
       json: 'application/json'
     },
     data: { unique: new Date().getTime(), registrySpace: (space != null) ? space: "" },
     dataType: 'json',
     success: function(data) {
       log.trace("Successfully loaded " + requestUrl);
       var _data = data;
       if(_data != null && _data != 'null') {
          if(_data.hasOwnProperty("componentDescription") && type == "components")
            _data = data.componentDescription;
          else if(_data.hasOwnProperty("profileDescription") && type == "profiles")
            _data = data.profileDescription;

          if(!$.isArray(_data))
            _data = [_data];

          handleSuccess(_data);
        }
     }.bind(this),
     error: function(xhr, status, err) {
       handleFailure("Error loading data from " + requestUrl + ": " + err);
     }.bind(this)
   }, corsRequestParams));
 },

 loadSpec: function(type, space, id, raw_type, handleSuccess, handleFailure) {
  var self = this;
  var typepath = (type === Constants.TYPE_PROFILE)?'/registry/profiles/':'/registry/components/';
  var requestUrl = restUrl + typepath + id;
  $.ajax($.extend({
    url: requestUrl,
    dataType: (raw_type != undefined) ? raw_type : "json",
    success: function(data) {
      log.trace("Successfully loaded ", requestUrl);

      var normalised = self.normaliseSpec(data);
      log.trace("Data:", data, "Normalised:", normalised);

      handleSuccess(normalised);
    }.bind(this),
    error: function(xhr, status, err) {
      handleFailure("Error loading spec for " + id + ": " + err);
    }.bind(this)
  }, corsRequestParams));
},

loadItem: function(id, handleSuccess, handleFailure) {
  var requestUrl = restUrl + "/registry/items/" + id;
  $.ajax($.extend({
    url: requestUrl,
    dataType: "json",
    success: function(data) {
      log.trace("Successfully loaded ", requestUrl);
      handleSuccess(data);
    }.bind(this),
    error: function(xhr, status, err) {
      handleFailure("Error loading spec for " + id + ": " + err);
    }.bind(this)
  }, corsRequestParams));
},

saveComponent: function(spec, item, profileId, update, publish, handleSuccess, handleFailure) {
  var actionType = (publish) ? "publish" : "update";
  var registry = item;

  log.debug('Data to save: ', spec, item);

  var data = Validation.validate(spec);

  if(data.errors != undefined) {
    log.debug("Validation failed:", data);
    var message = "Invalid specification:";
    for(i=0; i < data.errors.length; i++) {
      message += "\n" + data.errors[i].message;
    }
    return handleFailure(message, data); // return invalid
  }

  var cmd_schema_xml;
  try {
    cmd_schema_xml = marshaller.marshalString({ name: new Jsonix.XML.QName('CMD_ComponentSpec'), value: data });
    log.debug('cmd schema: ', cmd_schema_xml);
  } catch(e) {
    log.error("Failed to marshal spec", data, e);
    handleFailure(e);
    return;
  }

  var fd = new FormData();
  fd.append('profileId', profileId);
  fd.append('name', data.Header.Name);
  fd.append('description', data.Header.Description);
  fd.append('group', (item.groupName != undefined || item.groupName != null) ? item.groupName : "");
  fd.append('domainName', item.domainName);
  fd.append('data', new Blob([ cmd_schema_xml ], { type: "application/xml" }));

  var typeSpace = ComponentSpec.isProfile(spec) ? "profiles" : "components";
  var url = restUrl + '/registry/' + typeSpace;
  if(update) url += '/' + profileId + '/' + actionType;

  log.debug("POSTing to ", url);

  $.ajax($.extend({
      type: 'POST',
      url: url,
      data: fd,
      mimeType: 'multipart/form-data',
      username: Config.REST.auth.username,
      password: Config.REST.auth.password,
      xhrFields: {
        withCredentials: true
      },
      processData: false,
      contentType: false,
      dataType: "json",
      success: function(data) {
        //check response...

        if(data['@registered'] == "false") {
          log.error("Failed registration", data);
          if(data.errors != undefined) {
            handleFailure(data.errors.error);
          } else {
            handleFailure("Unknown error while registering component");
          }
        } else if(handleSuccess) {
          handleSuccess(data);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        log.trace("");
        handleFailure("Error saving spec: " + err, data);
      }.bind(this)
    }, corsRequestParams));
},

/**
 * Turns all CMD_Component and CMD_Element properties into arrays
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
normaliseSpec: function(data) {
  if (typeof data != 'object') {
    return data;
  }

  //var rootComponent = (data.Header != undefined) ? data.CMD_Component : data;
  if (data.Header != undefined) {
    //root component
    data.CMD_Component = this.normaliseSpec(data.CMD_Component);
  } else {
    if(data.hasOwnProperty("@ComponentId") && (data.CMD_Element || data.CMD_Component || data.AttributeList)) {
      log.debug("Encountered component children despite component id (", data["@ComponentId"], ")");
      //linked component - strip children
      delete data.CMD_Element;
      delete data.CMD_Component;
      delete data.AttributeList
    } else {
      log.trace("normalising", data);
      var childElems = data.CMD_Element;
      var childComps = data.CMD_Component;

      if(childElems != undefined && childElems != null) {
        //if CMD_Element child(ren) exist, make sure it is an array
        var elemsArray;
        if($.isArray(childElems)) {
          elemsArray = childElems;
        } else {
          elemsArray = [childElems];
        }

        // normalise element children (attributes) and value scheme
        for(i=0; i<elemsArray.length; i++) {
          this.normaliseAttributeList(elemsArray[i].AttributeList);
          this.normaliseValueScheme(elemsArray[i].ValueScheme);
        }
        data.CMD_Element = elemsArray;
      }

      // normalise attributes of this component
      this.normaliseAttributeList(data.AttributeList);

      //if CMD_Component child(ren) exist, make sure it is an array
      if(childComps != undefined && childComps != null) {
        if(!$.isArray(childComps)) {
          childComps = [childComps];
        }

        // normalise children
        var self = this;
        data.CMD_Component = childComps.map(function(comp, index) {
          return self.normaliseSpec(comp);
        });
      }
    }
  }

  return data;
},

normaliseAttributeList: function(attrList) {
  if(attrList != null) {
    log.trace("Normalise attribute list", attrList);

    //if AttributeList.Attribute exist, make sure it is an array
    var attr = attrList.Attribute;
    if(attr != undefined) {
      var attrArray;
      if ($.isArray(attr)) {
        attrArray = attr;
      } else {
        attrArray = [attr];
      }

      // normalise all value schemes in the attributes
      for(j=0; j<attrArray.length; j++) {
        this.normaliseValueScheme(attrArray[j].ValueScheme);
      }

      attrList.Attribute = attrArray;
    }
  }
},

normaliseValueScheme: function(valueScheme) {
  if(valueScheme != null) {
    log.trace("Normalise valueScheme", valueScheme);
    if(valueScheme.enumeration != null) {
      var item = valueScheme.enumeration.item;
      if(item != undefined && !$.isArray(item)) {
        valueScheme.enumeration.item = [item];
      }
    }
  }
},

deleteComponents: function(type, space, id, handleSuccess, handleFailure) {
  //setTimeout(function(){handleSuccess();}, 1000);
  setTimeout(function(){handleFailure("deletion not implemented yet");}, 1000);
},

loadAllowedTypes: function(cb) {
  $.ajax($.extend({
    type: 'GET',
    url: restUrl + '/registry/AllowedTypes',
    processData: false,
    contentType: false,
    dataType:'json',
    success: function(data) {
      if(cb) cb(data);
    }.bind(this),
    error: function(xhr, status, err) {
      log.error("Failed to retrieve allowed types", err);
      cb(null);
    }.bind(this)
  }, corsRequestParams));
},

usageCheck: function(componentId, cb) {
  var url = restUrl +'/registry/components/usage/' + componentId;

  $.ajax($.extend({
    type: 'GET',
    url: url,
    dataType: "json",
    success: function(data) {
      log.trace('return usage check: ' + data);
      cb(data);
    }.bind(this),
    error: function(xhr, status, err) {
      log.error("Failed to perform usage check", err);
      cb(null);
    }.bind(this)
  }, corsRequestParams));
},

queryCCR: function(searchQuery, cb) {
  var url = ccrUrl + '?type=container&keywords=' + searchQuery;

  if(searchQuery != null || searchQuery != "")
    $.ajax($.extend({
      type: 'GET',
      url: url,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function(data) {
        if(cb)
          cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        cb(null);
      }.bind(this)
    }, corsRequestParams));
},

getAuthState: function(handleSuccess, handleFailure) {
  return $.ajax($.extend({
   url: authUrl,
   type: 'GET',
   dataType: 'json',
   success: function (result){
     log.trace("Auth check result:", result);
     isAuth = result.authenticated === 'true';
     handleSuccess({
       authenticated: isAuth,
       uid: isAuth ? result.username : null,
       displayName: isAuth ? result.displayName : null,
       token: Math.random().toString(36).substring(7)
     });
   },
   error: function(xhr, status, err) {
     handleFailure("Could not check authentication state: " + err);
   }
  }, corsRequestParams));
}

};

module.exports = ComponentRegistryClient;
