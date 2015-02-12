/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var InfoPanel = require('./InfoPanel.jsx')

//require('../../styles/ComponentOverview.sass');

var ComponentOverview = React.createClass({
  getInitialState: function() {
    return { component: null }
  },
  loadComponent: function(componentId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/components/' + componentId,
      dataType: 'json',
      success: function(data) {
        this.setState({component: data});
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
    if(nextProps.componentId != null)
      this.loadComponent(nextProps.componentId);
  },
  render: function () {
    return (
      <div className="infoPanel_wrapper">
        <InfoPanel item={this.state.component} />
      </div>
    );
  }
});

module.exports = ComponentOverview;
