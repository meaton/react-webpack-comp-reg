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

var PROFILES_PATH = "profiles";
var COMPONENTS_PATH = "components";

var corsRequestParams = (Config.cors) ?
  { username: Config.REST.auth.username,
    password: Config.REST.auth.password,
    xhrFields: {
      withCredentials: true
  }} : {};


function getRegistryUrl(type, id) {
  var typepath = '/registry/' + ((type === Constants.TYPE_PROFILE)?PROFILES_PATH:COMPONENTS_PATH);
  var requestUrl = restUrl + typepath;
  if(id == null) {
    return requestUrl;
  } else {
    return requestUrl + "/" + id;
  }
}

var ComponentRegistryClient = {

  getRegistrySpacePath: function(space) {
    if(space == Constants.SPACE_PUBLISHED) {
      return "published";
    }
    if(space == Constants.SPACE_PRIVATE) {
      return "private";
    }
    if(space == Constants.SPACE_TEAM) {
      return "group";
    }
  },

  loadComponents: function(type, space, group, handleSuccess, handleFailure) {
    var requestUrl = getRegistryUrl(type);

    var registrySpace = (space != null) ? this.getRegistrySpacePath(space): "";
    var teamId = (space == Constants.SPACE_TEAM) ? group : null;

    $.ajax($.extend({
     url: requestUrl,
     accepts: {
       json: 'application/json'
     },
     data: { unique: new Date().getTime(), registrySpace: registrySpace, groupId: teamId },
     dataType: 'json',
     success: function(data) {
       log.trace("Successfully loaded " + requestUrl);
       var _data = data;
       if(_data != null && _data != 'null') {
          if(_data.hasOwnProperty("componentDescription") && type == Constants.TYPE_COMPONENT)
            _data = data.componentDescription;
          else if(_data.hasOwnProperty("profileDescription") && type == Constants.TYPE_PROFILE)
            _data = data.profileDescription;

          if(!$.isArray(_data)) {
            _data = [_data];
          }

          _data = _data.map(function(item){
            //comments count is provided as string, better (e.g. for sorting) to turn into integer
            if(item.commentsCount) {
              item.commentsCount = parseInt(item.commentsCount);
            }
            return item;
          });

          handleSuccess(_data);
        } else {
          log.debug("Empty response from", requestUrl);
          //nothing was returned, empty workspace
          handleSuccess([]);
        }
     }.bind(this),
     error: function(xhr, status, err) {
       handleFailure("Error loading data from " + requestUrl + ": " + err);
     }.bind(this)
   }, corsRequestParams));
 },

 loadSpec: function(type, id, raw_type, handleSuccess, handleFailure) {
  var self = this;
  var requestUrl = getRegistryUrl(type, id);
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

  var typeSpace = ComponentSpec.isProfile(spec) ? PROFILES_PATH : COMPONENTS_PATH;
  var url = restUrl + '/registry/' + typeSpace;
  if(update) url += '/' + profileId + '/' + actionType;

  log.debug("POSTing to ", url);

  $.ajax($.extend({
      type: 'POST',
      url: url,
      data: fd,
      mimeType: 'multipart/form-data',
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

deleteComponent: function(type, itemId, handleSuccess, handleFailure) {
  var requestUrl = getRegistryUrl(type, itemId);

  $.ajax($.extend({
    type: 'DELETE',
    url: requestUrl,
    success: function(data) {
      handleSuccess(data);
    }.bind(this),
    error: function(xhr, status, err) {
      handleFailure(err);
    }.bind(this)
  }, corsRequestParams));
},

transferComponent: function(itemId, teamId, handleSuccess, handleFailure) {
  var url = restUrl + '/registry/items/' + itemId + '/transferownership?groupId=' + teamId;
  $.ajax($.extend({
    type: 'POST',
    data: {groupId: teamId},
    url: url,
    processData: false,
    contentType: false,
    dataType: "text", //will return something like "Ownership transferred"
    success: function() {
      handleSuccess();
    }.bind(this),
    error: function(xhr, status, err) {
      handleFailure("Failed to transfer component:" + err);
    }.bind(this)
  }, corsRequestParams));
},

loadComments: function(componentId, type, success, failure) {
  var reg_type = (type === Constants.TYPE_PROFILE) ? PROFILES_PATH : COMPONENTS_PATH;

  $.ajax($.extend({
    url: restUrl + '/registry/' + reg_type + '/' + componentId + '/comments',
    dataType: "json",
    success: function(data) {
      if(success && data != null) {
        if(data.comment != null) {
          success(data.comment);
        } else {
          success(data);
        }
      } else {
        success([]);
      }
    }.bind(this),
    error: function(xhr, status, err) {
      failure(err);
    }.bind(this)
  }, corsRequestParams));
},

saveComment: function(componentId, type, comment, success, failure) {
  var comments_xml = "<comment><comments>" + comment + "</comments><commentDate/>";
  var reg_type = (type === Constants.TYPE_PROFILE) ? PROFILES_PATH : COMPONENTS_PATH;
  var url = restUrl + '/registry/' + reg_type + '/' + componentId + '/comments/';

  var fd = new FormData();

  if(type === Constants.TYPE_PROFILE) {
    comments_xml += "<componentId>" + componentId + "</componentId>";
  } else if (type === Constants.TYPE_COMPONENT) {
    comments_xml += "<componentId>" + componentId + "</componentId>";
  }

  comments_xml += "<userName/></comment>";

  fd.append('data', new Blob([ comments_xml ], { type: "application/xml" }));

  $.ajax($.extend({
    type: 'POST',
    url: url,
    data: fd,
    processData: false,
    contentType: false,
    dataType: "json",
    success: function(data) {
      log.trace('comment saved: ', data);
      if(data['@registered'] == 'true') {
        success(data.comment);
      } else {
        failure(data.errors);
      }
    }.bind(this),
    error: function(xhr, status, err) {
      failure(err);
    }.bind(this)
  }, corsRequestParams));
},

deleteComment: function(componentId, type, commentId, success, failure) {
  var reg_type = (type === Constants.TYPE_PROFILE) ? PROFILES_PATH : COMPONENTS_PATH;
  var url = restUrl + '/registry/' + reg_type + '/' + componentId + '/comments/' + commentId;

  $.ajax($.extend({
    type: 'POST',
    url: url,
    data: { method: 'DELETE' }, // used for POST method of deletion
    success: function(data) {
      success(commentId, data);
    }.bind(this),
    error: function(xhr, status, err) {
      failure(err);
    }.bind(this)
  }, corsRequestParams));
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

loadTeams: function(success, failure) {
  $.ajax($.extend({
    type: 'GET',
    url: restUrl + '/registry/groups/usermembership',
    processData: false,
    contentType: false,
    dataType:'json',
    success: function(data) {
      if(data == null) {
        success([]);
      } else {
        success(data.group);
      }
    }.bind(this),
    error: function(xhr, status, err) {
      failure(err);
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
       isAdmin: isAuth? result.isAdmin === "true" : false
     });
   },
   error: function(xhr, status, err) {
     handleFailure("Could not check authentication state: " + err);
   }
  }, corsRequestParams));
}

};

module.exports = ComponentRegistryClient;
