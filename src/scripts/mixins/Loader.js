var Config = require('../config');
var LoaderMixin = {
  loadProfile: function(profileId, raw_type) {
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
        if(raw_type != undefined && raw_type != "json")
          this.setState({profile_xml: data, visible: true});
        else
          this.setState({profile: data, visible: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId, status, err.toString());
      }.bind(this)
    });
  },
  loadComponent: function(componentId, raw_type) {
    var type = (raw_type != undefined || raw_type == "json") ? "/" + raw_type : "";
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/components/' + componentId,
      dataType: (raw_type != undefined) ? raw_type : "json",
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        if(raw_type != undefined && raw_type != "json")
          this.setState({component_xml: data, visible: true});
        else
          this.setState({component: data, visible: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err.toString());
      }.bind(this)
    });
  },
  loadComments: function(componentId, isProfile) {
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
          if(data != null)
            this.setState({comments: data.comment});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err.toString());
      }.bind(this)
    });
  },
  componentWillMount: function() {
    console.log('Loader mount');
  },
  componentDidMount: function() {
    console.log('Loader did mount');
    if(this.props.profileId != undefined && this.props.profileId != null)
      this.loadProfile(this.props.profileId);
    else if(this.props.componentId != undefined && this.props.componentId != null)
      this.loadComponent(this.props.componentId);
  },
  componentWillUnmount: function() {
    console.log('Loader unmount');
  }
};

module.exports = LoaderMixin;
