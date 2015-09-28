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
var authUrl = restUrl + "/authentication"

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
  var typepath = (type === Constants.TYPE_PROFILE)?'/registry/profiles/':'/registry/components/';
  var requestUrl = restUrl + typepath + id;
  $.ajax($.extend({
    url: requestUrl,
    dataType: (raw_type != undefined) ? raw_type : "json",
    success: function(data) {
      log.trace("Successfully loaded ", requestUrl);
      handleSuccess(data);
    }.bind(this),
    error: function(xhr, status, err) {
      handleFailure("Error loading spec for " + id + ": " + err);
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
