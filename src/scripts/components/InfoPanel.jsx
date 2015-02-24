'use strict';

var React = require('react/addons');
var Config = require('../config.js');

/** Bootstrap components */
var TabbedArea = require('react-bootstrap/TabbedArea');
var TabPane = require('react-bootstrap/TabPane');
var Panel = require('react-bootstrap/Panel');

//require('../../styles/InfoPanel.sass');

var {PrismCode} = require('react-prism');
var moment = require('moment-timezone');

var InfoPanel = React.createClass({
  propTypes: {
    item: React.PropTypes.object,
    load_data: React.PropTypes.func,
    xml_data: React.PropTypes.string // XMLDocument or String
  },
  getInitialState: function() {
    return { registry: null, xml_data: null, comments_data: [], currentTabIdx: 0 }
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
        this.setState({registry: data, currentTabIdx: 0});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(itemId, status, err.toString());
      }.bind(this)
    });
  },
  tabSelect: function(index) {
    console.log('tabSelect: ' + index);
    if(index == 1)
      this.props.load_data();

    this.setState({ currentTabIdx: index});
  },
  componentWillReceiveProps: function(nextProps) {
      if(nextProps.xml_data != null)
        this.setState({xml_data: nextProps.xml_data});
      else if(nextProps.item != null) {
        if(nextProps.comments_data != null)
          if($.isArray(nextProps.comments_data))
            this.setState({comments_data: nextProps.comments_data});
          else
            this.setState({comments_data: [nextProps.comments_data]})

        this.getItemData(nextProps.item.Header.ID);
      }
  },
  processComments: function() {
    var comments = this.state.comments_data;
    if(comments != null && comments.length > 0)
      return (
        comments.map(function(comment, index) {
          return (
            <div className="comment">
              <span className="comment-name">{comment.userName}</span>
              <span className="comment-date">{ moment(comment.commentDate).format('LLL') }</span>
              <p className="comment-comments">{comment.comments}</p>
            </div>
          );
        })
      );
    else
      return React.createElement('div', {className: "comment empty"}, "No Comments");
  },
  render: function () {
    console.log('render info');
    var item = this.props.item;
    var xmlElement = null;

    if(item == null)
      return null;

    var prismCode = (
      <PrismCode className="language-xml">{this.state.xml_data}</PrismCode>
    );

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
        <TabPane eventKey={1} tab="xml">
            {(this.state.xml_data != null) ? prismCode : "loading.." }
        </TabPane>
        <TabPane eventKey={2} tab={"Comments (" + this.state.comments_data.length + ")"}>
            {this.processComments()}
        </TabPane>
      </TabbedArea>
    );
  }
});

module.exports = InfoPanel;
