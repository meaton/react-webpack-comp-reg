var clone = require('clone');

//JSONIX
var Jsonix = require('jsonix').Jsonix;
var CMD = require('../../../mappings/Component').Component;
var context = new Jsonix.Context([CMD]);
var marshaller = context.createMarshaller();

var Config = require('../../config').Config;
var restUrl = require('../../config').restUrl;

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

 loadSpec: function(type, space, id, handleSuccess, handleFailure) {
   var err = "test";
   handleFailure("Error loading spec for " + id + ": " + err);
 }

};

module.exports = ComponentRegistryClient;
