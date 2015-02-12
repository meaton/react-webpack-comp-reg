/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

//require('../../styles/InfoPanel.sass');

var InfoPanel = React.createClass({
  getInitialState: function() {
    return { registry: null, currentTabIdx: 0 }
  },
  getItemData: function(itemId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/items/' + itemId,
      dataType: 'json',
      success: function(data) {
        this.setState({registry: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(itemId, status, err.toString());
      }.bind(this)
    });
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
      <div className={(item['@isProfile']) ? "profile" : "component"}>
        <ul>
          <li><span>Name:</span>{item.Header.Name}</li>
          <li><span>Group (Name):</span>{(this.state.registry) ? this.state.registry.groupName : ""}</li>
          <li><span>Description:</span>{item.Header.Description}</li>
          <li><span>ConceptLink:</span><a href={item.CMD_Component["@ConceptLink"]}>{item.CMD_Component["@ConceptLink"]}</a></li>
        </ul>
      </div>
    );
  }
});

module.exports = InfoPanel;
