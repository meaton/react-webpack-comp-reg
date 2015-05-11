var Config = require('../config');
var Jsonix = require('jsonix').Jsonix;
var clone = require('clone');
var CMD = require('../../mappings/Component').Component;
var context = new Jsonix.Context([CMD]);
var marshaller = context.createMarshaller();

var LoaderMixin = {
  loadProfile: function(profileId, raw_type, cb) {
    var type = (raw_type != undefined || raw_type == "json") ? "/" + raw_type : "";
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + profileId,
      dataType: (raw_type != undefined) ? raw_type : "json",
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId, status, err);
      }.bind(this)
    });
  },
  loadComponent: function(componentId, raw_type, cb) {
    var syncData = null;
    var type = (raw_type != undefined || raw_type == "json") ? "/" + raw_type : "";
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/components/' + componentId,
      dataType: (raw_type != undefined) ? raw_type : "json",
      username: Config.auth.username,
      password: Config.auth.password,
      async: false, //TODO: sync is dep
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    });
  },
  getItemName: function(itemId, cb) {
    var name = null;
    this.loadRegistryItem(itemId, function(data) {
      name = data.name;
    });

    return name;
  },
  loadRegistryItem: function(itemId, cb) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/items/' + itemId,
      dataType: "json",
      username: Config.auth.username,
      password: Config.auth.password,
      async: false,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        console.log('return 200 registry item: ' + data != null);
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    });
  },
  loadComments: function(componentId, isProfile, cb) {
    var reg_type = (isProfile) ? "profiles" : "components";
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/' + reg_type + '/' + componentId + '/comments',
      dataType: "json",
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        if(cb && data != null) if(data.comment != null) cb(data.comment); else cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    });
  },
  handlePostData: function(data, childElems, childComps) {
    var self = this;
    var rootComponent = (data.Header != undefined) ? data.CMD_Component : data;

    rootComponent.CMD_Component = (childComps != undefined || childComps != null) ? childComps.map(function(comp, index) {
        var newComp = comp;
        var componentId = null;

        if(comp.Header != undefined && comp.CMD_Component != undefined && !$.isArray(comp.CMD_Component)) {
          newComp = comp.CMD_Component;
          componentId = comp.Header.ID;
        } else if(comp.hasOwnProperty("@ComponentId")) {
          componentId = comp['@ComponentId'];
        }

        if(componentId != null)
          return { '@ComponentId': componentId,
                 '@CardinalityMin': newComp['@CardinalityMin'],
                 '@CardinalityMax': newComp['@CardinalityMax'] };
        else
          return self.handlePostData(newComp, newComp.CMD_Element, newComp.CMD_Component);
    }) : undefined;

    rootComponent.CMD_Element = childElems;

    return data;
  },
  saveProfile: function(profileId, update, publish, cb) {
    var actionType = (publish) ? "publish" : "update";
    var registry = this.state.registry;

    console.log('child components: ' + $.isArray(this.state.childComponents));
    console.log('child elements: ' + $.isArray(this.state.childElements));

    var data = this.handlePostData(clone(this.state.profile), this.state.childElements, this.state.childComponents);
    console.log('data: ' + JSON.stringify(data));

    var cmd_schema_xml = marshaller.marshalString({ name: new Jsonix.XML.QName('CMD_ComponentSpec'), value: data });
    console.log('cmd schema: ' + cmd_schema_xml);

    var fd = new FormData();
    fd.append('profileId', profileId);
    fd.append('name', data.Header.Name);
    fd.append('description', data.Header.Description);
    fd.append('group', (registry.groupName != undefined || registry.groupName != null) ? registry.groupName : "");
    fd.append('domainName', registry.domainName);
    fd.append('data', new Blob([ cmd_schema_xml ], { type: "application/xml" }));

    /* CORS issue using XHR natively
    var createCORSRequest = function(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

      } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

      } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

      }
      return xhr;
    }

    var url = 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + profileId + '/' + actionType;
    var xhr = createCORSRequest('POST', url);
    if (!xhr) {
      throw new Error('CORS not supported');
    }
    xhr.withCredentials = true;
    xhr.setRequestHeader(
      'Authorization','Basic ' + btoa(Config.auth.username + ':' + Config.auth.password)
    );

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) console.log('returned');
      } else console.log('error: ' + xhr.responseText);
    };

    xhr.send(fd);
    */

    var url = 'http://localhost:8080/ComponentRegistry/rest/registry/profiles';
    if(update) url += '/' + profileId + '/' + actionType;

    $.ajax({
        type: 'POST',
        url: url,
        data: fd,
        mimeType: 'multipart/form-data',
        username: Config.auth.username,
        password: Config.auth.password,
        xhrFields: {
          withCredentials: true
        },
        processData: false,
        contentType: false,
        dataType: "json",
        success: function(data) {
          if(cb) cb(data);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(componentId, status, err);
        }.bind(this)
      });
  },
  saveComponent: function(componentId, update, publish, cb) {
    var actionType = (publish) ? "publish" : "update";
    var registry = this.state.registry;

    console.log('child components: ' + $.isArray(this.state.childComponents));
    console.log('child elements: ' + $.isArray(this.state.childElements));

    var data = this.handlePostData(clone(this.state.component), this.state.childElements, this.state.childComponents);
    console.log('data: ' + JSON.stringify(data));

    var cmd_schema_xml = marshaller.marshalString({ name: { localPart: "CMD_ComponentSpec" }, value: data });
    console.log('cmd schema: ' + cmd_schema_xml);

    var fd = new FormData();
    fd.append('componentId', componentId);
    fd.append('name', data.Header.Name);
    fd.append('description', data.Header.Description);
    fd.append('group', registry.groupName);
    fd.append('domainName', registry.domainName);
    fd.append('data', new Blob([ cmd_schema_xml ], { type: "application/xml" }));

    var url = 'http://localhost:8080/ComponentRegistry/rest/registry/components';
    if(update) url += '/' + componentId + '/' + actionType;
    $.ajax({
      type: 'POST',
      url: url,
      data: fd,
      mimeType: 'multipart/form-data',
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      processData: false,
      contentType: false,
      dataType: "json",
      success: function(data) {
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    });
  },
  deleteItem: function(type, itemId, cb) {
    var url = 'http://localhost:8080/ComponentRegistry/rest/registry/' + type + '/' + itemId;
    $.ajax({
      type: 'DELETE', // 'POST' /* Note testing locally with CORS enable DELETE method in init-config accepted methods */
      url: url,
      //data: { method: 'DELETE' }, // used for POST method of deletion
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        console.log('return delete action: ' + data);
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(itemId, status, err);
      }.bind(this)
    });
  },
  componentWillMount: function() {
    console.log('Loader mount');
  },
  componentDidMount: function() {
    console.log('Loader did mount');
    var self = this;
    if(this.context.router != undefined && this.getParams().profile != undefined)
      this.loadProfile(this.getParams().profile, "json", function(data) {
          self.setState({profile: data, visible: true});
      });
    else if(this.context.router != undefined && this.getParams().component != undefined)
      this.loadComponent(this.getParams().component, "json", function(data) {
          self.setState({component: data, visible: true});
      });
  },
  componentWillUnmount: function() {
    console.log('Loader unmount');
  }
};

module.exports = LoaderMixin;
