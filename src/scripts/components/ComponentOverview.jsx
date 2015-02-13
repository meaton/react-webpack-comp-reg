/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var InfoPanel = require('./InfoPanel.jsx')
var Config = require('../config.js');

var ComponentOverview = React.createClass({
  getInitialState: function() {
    return { component: null, visible: false }
  },
  loadComponent: function(componentId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/components/' + componentId,
      dataType: 'json',
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        this.setState({component: data, visible: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(componentId, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    if(this.props.componentId != null)
      this.loadComponent(this.props.componentId);
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.componentId != null) {
      this.loadComponent(nextProps.componentId);
    } else
      this.setState({visible: false});
  },
  render: function () {
    var hideClass = (!this.state.visible) ? "hide" : "show";
    return (
      <div className={hideClass}>
        <InfoPanel item={this.state.component} />
      </div>
    );
  }
});

module.exports = ComponentOverview;
