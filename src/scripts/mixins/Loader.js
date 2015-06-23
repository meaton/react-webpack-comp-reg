var clone = require('clone');

//JSONIX
var Jsonix = require('jsonix').Jsonix;
var CMD = require('../../mappings/Component').Component;
var context = new Jsonix.Context([CMD]);
var marshaller = context.createMarshaller();

var Config = require('../config').Config;
var restUrl = require('../config').restUrl;

var corsRequestParams = (Config.dev) ?
  { username: Config.REST.auth.username,
    password: Config.REST.auth.password,
    xhrFields: {
      withCredentials: true
  }} : {};

/**
* LoaderMixin - AJAX calls to the Component Registry REST service
* @mixin
*/
var LoaderMixin = {
  // TODO: Check user is logged in if loading private or group spaces
  loadData: function(nextFilter, nextType) {
    this.setLoading(true);

    var type = (nextType != null) ? nextType.toLowerCase() : this.props.type.toLowerCase();
    $.ajax($.extend({
     url: restUrl + '/registry/' + type,
     accepts: {
       json: 'application/json'
     },
     data: { unique: new Date().getTime(), registrySpace: (nextFilter != null) ? nextFilter: this.props.filter },
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
        }

       this.setState({data: (_data != null && _data != 'null') ? _data : [], currentFilter: nextFilter || this.props.filter, currentType: nextType || this.props.type, lastSelectedItem: null});
     }.bind(this),
     error: function(xhr, status, err) {
       console.error(status, err);
     }.bind(this)
   }, corsRequestParams));
  },
  loadProfile: function(profileId, raw_type, cb) {
    var type = (raw_type != undefined || raw_type == "json") ? "/" + raw_type : "";

    $.ajax($.extend({
      url: restUrl + '/registry/profiles/' + profileId,
      dataType: (raw_type != undefined) ? raw_type : "json",
      success: function(data) {
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  loadComponent: function(componentId, raw_type, cb) {
    var syncData = null;
    var type = (raw_type != undefined || raw_type == "json") ? "/" + raw_type : "";

    $.ajax($.extend({
      url: restUrl + '/registry/components/' + componentId,
      dataType: (raw_type != undefined) ? raw_type : "json",
      async: false, //TODO sync is dep, review CMDComponent parseComponents usage
      success: function(data) {
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  getItemName: function(itemId, cb) { // cannot sync call require callback
    var name = null;

    this.loadRegistryItem(itemId, function(data) {
      if(cb) return cb(data.name);
      else name = data.name;
    });

    return name;
  },
  loadRegistryItem: function(itemId, cb) {
    $.ajax($.extend({
      url: restUrl + '/registry/items/' + itemId,
      dataType: "json",
      success: function(data) {
        console.log('return 200 registry item: ' + data != null);
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  loadComments: function(componentId, isProfile, cb) {
    var reg_type = (isProfile) ? "profiles" : "components";

    $.ajax($.extend({
      url: restUrl + '/registry/' + reg_type + '/' + componentId + '/comments',
      dataType: "json",
      success: function(data) {
        if(cb && data != null) if(data.comment != null) cb(data.comment); else cb(data);
        else cb([]);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  handlePostData: function(data, childElems, childComps) {
    var self = this;
    var rootComponent = (data.Header != undefined) ? data.CMD_Component : data;

    if(childComps != undefined && childComps != null && !$.isArray(childComps)) {
      console.warn('Warning found non-Array object:' + JSON.stringify(childComps));
    }

    rootComponent.CMD_Component = (childComps != undefined && childComps != null) ?
      childComps.map(function(comp, index) {
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

    var data = this.validate(this.handlePostData(clone(this.state.profile), this.state.childElements, this.state.childComponents));
    console.log('data: ' + JSON.stringify(data));

    if(data.errors != undefined)
      return cb(data); // return invalid

    var cmd_schema_xml = marshaller.marshalString({ name: new Jsonix.XML.QName('CMD_ComponentSpec'), value: data });
    console.log('cmd schema: ' + cmd_schema_xml);

    var fd = new FormData();
    fd.append('profileId', profileId);
    fd.append('name', data.Header.Name);
    fd.append('description', data.Header.Description);
    fd.append('group', (registry.groupName != undefined || registry.groupName != null) ? registry.groupName : "");
    fd.append('domainName', registry.domainName);
    fd.append('data', new Blob([ cmd_schema_xml ], { type: "application/xml" }));

    var url = restUrl + '/registry/profiles';
    if(update) url += '/' + profileId + '/' + actionType;

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
          if(cb) cb(data);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(componentId, status, err);
        }.bind(this)
      }, corsRequestParams));
  },
  saveComponent: function(componentId, update, publish, cb) {
    var actionType = (publish) ? "publish" : "update";
    var registry = this.state.registry;

    console.log('child components: ' + $.isArray(this.state.childComponents));
    console.log('child elements: ' + $.isArray(this.state.childElements));

    var data = this.validate(this.handlePostData(clone(this.state.component), this.state.childElements, this.state.childComponents));
    console.log('data: ' + JSON.stringify(data));

    if(data.errors != undefined) return cb(data); //invalid

    var cmd_schema_xml = marshaller.marshalString({ name: { localPart: "CMD_ComponentSpec" }, value: data });
    console.log('cmd schema: ' + cmd_schema_xml);

    var fd = new FormData();
    fd.append('componentId', componentId);
    fd.append('name', data.Header.Name);
    fd.append('description', data.Header.Description);
    fd.append('group', registry.groupName);
    fd.append('domainName', registry.domainName);
    fd.append('data', new Blob([ cmd_schema_xml ], { type: "application/xml" }));

    var url = restUrl + '/registry/components';
    if(update) url += '/' + componentId + '/' + actionType;
    $.ajax($.extend({
      type: 'POST',
      url: url,
      data: fd,
      mimeType: 'multipart/form-data',
      processData: false,
      contentType: false,
      dataType: "json",
      success: function(data) {
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  /* CORS issue using XHR natively
  corsRequest: function() {
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

    var url = restUrl + '/registry/profiles/' + profileId + '/' + actionType;
    var xhr = createCORSRequest('POST', url);
    if (!xhr) {
      throw new Error('CORS not supported');
    }
    xhr.withCredentials = true;
    xhr.setRequestHeader(
      'Authorization','Basic ' + btoa(Config.REST.auth.username + ':' + Config.REST.auth.password)
    );

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) console.log('returned');
      } else console.log('error: ' + xhr.responseText);
    };

    xhr.send(fd);

  },*/
  saveComment: function(comment, profileId, componentId, cb) {
    //POST
    /*<comment>
      <comments>test comment</comments>
      <commentDate/>
      <componentId>clarin.eu:cr1:p_1433928406468</componentId>
      <userName/>
    </comment>*/
    var comments_xml = "<comment><comments>" + comment + "</comments><commentDate/>";
    var url = restUrl + '/registry/';

    var fd = new FormData();

    if(profileId != null) {
      url += 'profiles/' + profileId + '/comments/';
      comments_xml += "<componentId>" + profileId + "</componentId>";
    } else if (componentId != null) {
      url += 'components/' + componentId + '/comments/';
      comments_xml += "<componentId>" + componentId + "</componentId>";
    }

    comments_xml += "<userName/></comment>";

    fd.append('data', new Blob([ comments_xml ], { type: "application/xml" }));

    console.log('sending comment POST: ' + comments_xml, profileId || componentId);

    $.ajax($.extend({
      type: 'POST',
      url: url,
      data: fd,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function(data) {
        console.log('comment saved: ' + JSON.stringify(data));
        if(cb) cb(data.id);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId || componentId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  deleteItem: function(type, itemId, cb) {
    var url = restUrl + '/registry/' + type + '/' + itemId;

    $.ajax($.extend({
      type: 'DELETE', // 'POST' // Note testing locally with CORS enable DELETE method in init-config accepted methods
      url: url,
      //data: { method: 'DELETE' }, // used for POST method of deletion
      success: function(data) {
        console.log('return delete action: ' + data);
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(itemId, status, err);
      }.bind(this)
    }, corsRequestParams));
  },
  deleteComment: function(commentId, profileId, componentId, cb) {
    var type = "profiles";
    var itemId = profileId;

    if(profileId == null && componentId != null) {
      type = "components";
      itemId = componentId;
    }

    var url = restUrl + '/registry/' + type + '/' + itemId + '/comments/' + commentId;

    $.ajax($.extend({
      type: 'POST',
      url: url,
      data: { method: 'DELETE' }, // used for POST method of deletion
      success: function(data) {
        console.log('return delete action: ' + data);
        if(cb) cb(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(itemId, status, err);
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
        cb(null);
      }.bind(this)
    }, corsRequestParams));
  },
  queryCCR: function(searchQuery, cb) {
    var url = restUrl + '/ccr?type=container&keywords=' + searchQuery;

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
