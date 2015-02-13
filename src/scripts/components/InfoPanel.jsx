/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Config = require('../config.js');

/** Bootstrap components */
var TabbedArea = require('react-bootstrap/TabbedArea');
var TabPane = require('react-bootstrap/TabPane');
var Panel = require('react-bootstrap/Panel');

//require('../../styles/InfoPanel.sass');

var InfoPanel = React.createClass({
  getInitialState: function() {
    return { registry: null, currentTabIdx: 0 }
  },
  getItemData: function(itemId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/items/' + itemId,
      dataType: 'json',
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        this.setState({registry: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(itemId, status, err.toString());
      }.bind(this)
    });
  },
  tabSelect: function(index) {
    this.setState({ currentTabIdx: index });
  },
  componentWillReceiveProps: function(nextProps) {
      if(nextProps.item != null)
        this.getItemData(nextProps.item.Header.ID);
  },
  render: function () {
    var item = this.props.item;

    if(item == null)
      return null;

    return (
      <TabbedArea activeKey={this.state.currentTabIdx} onSelect={this.tabSelect} className={(item['@isProfile']) ? "profile" : "component"}>
        <TabPane eventKey={0} tab="view">
          <ul>
            <li><span>Name:</span>{item.Header.Name}</li>
            <li><span>Group (Name):</span>{(this.state.registry) ? this.state.registry.groupName : ""}</li>
            <li><span>Description:</span>{item.Header.Description}</li>
            <li><span>ConceptLink:</span><a href={item.CMD_Component["@ConceptLink"]}>{item.CMD_Component["@ConceptLink"]}</a></li>
          </ul>
        </TabPane>
        <TabPane eventKey={1} tab="xml"/>
        <TabPane eventKey={2} tab="comments"/>
      </TabbedArea>
    );
  }
});

module.exports = InfoPanel;
