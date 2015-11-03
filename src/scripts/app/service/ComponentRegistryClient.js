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

var Validation = require('./Validation');

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

  var data = Validation.validate(spec);

  log.debug('data to save: ', data, item);

  if(data.errors != undefined)
    return handleFailure("Invalid specification", data); // return invalid

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

  var typeSpace = (spec["@isProfile"] == "true") ? "profiles" : "components";
  var url = restUrl + '/registry/' + typeSpace;
  if(update) url += '/' + profileId + '/' + actionType;

  log.debug("POSTing to ", url);

  // $.ajax($.extend({
  //     type: 'POST',
  //     url: url,
  //     data: fd,
  //     mimeType: 'multipart/form-data',
  //     username: Config.REST.auth.username,
  //     password: Config.REST.auth.password,
  //     xhrFields: {
  //       withCredentials: true
  //     },
  //     processData: false,
  //     contentType: false,
  //     dataType: "json",
  //     success: function(data) {
  //       if(handleSuccess) handleSuccess(data);
  //     }.bind(this),
  //     error: function(xhr, status, err) {
  //       log.trace("");
  //       handleFailure("Error saving spec: " + err, data);
  //     }.bind(this)
  //   }, corsRequestParams));

  handleFailure("test", data);
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
    var childElems = data.CMD_Element;
    var childComps = data.CMD_Component;

    if(childElems != undefined && childElems != null) {
      if(!$.isArray(childElems)) {
        data.CMD_Element = [childElems];
      }
    }

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

  return data;
},

deleteComponents: function(type, space, id, handleSuccess, handleFailure) {
  //setTimeout(function(){handleSuccess();}, 1000);
  setTimeout(function(){handleFailure("deletion not implemented yet");}, 1000);
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
