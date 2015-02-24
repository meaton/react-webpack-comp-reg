'use strict';

var React = require('react');
var Config = require('../config.js');

/** Bootstrap components */
var InfoPanel = require('./InfoPanel.jsx');

var ComponentOverview = React.createClass({
  propTypes: {
    componentId: React.PropTypes.string
  },
  getInitialState: function() {
    return { component: null, component_xml: null, comments: null, visible: false }
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
          this.setState({component: data, component_xml: null, visible: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err.toString());
      }.bind(this)
    });

    this.loadComments(componentId);
  },
  loadComments: function(componentId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/components/' + componentId + '/comments',
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
        console.error(profileId, status, err.toString());
      }.bind(this)
    });
  },
  loadComponentXml: function() {
    this.loadComponent(this.props.componentId, "text");
  },
  componentDidMount: function() {
    if(this.props.componentId != null)
      this.loadComponent(this.props.componentId);
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.componentId && (this.props.componentId != nextProps.componentId)) {
      this.state.comments = null;
      this.loadComponent(nextProps.componentId);
    } else
      this.setState({visible: false});
  },
  render: function () {
    var hideClass = (!this.state.visible) ? "hide" : "show";
    return (
      <div className={hideClass}>
        <InfoPanel item={this.state.component} load_data={this.loadComponentXml} xml_data={this.state.component_xml} comments_data={this.state.comments} />
      </div>
    );
  }
});

module.exports = ComponentOverview;
