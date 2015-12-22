'use strict';

var log = require('loglevel');

var React = require('react'),
    Constants = require("../../constants");

//bootstrap
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');

//components
var ComponentSpecView = require('./ComponentSpecView');
var Comments = require('./Comments');
var XmlPanel = require('./XmlPanel');

//utils
var ComponentSpec = require('../../service/ComponentSpec');
var classNames = require('classnames');

require('../../../../styles/InfoPanel.sass');

/**
* InfoPanel - displays the loaded registry item data and comments in Bootstrap tabbed-panes.
* @constructor
*/
var InfoPanel = React.createClass({
  propTypes: {
    activeView: React.PropTypes.string.isRequired,
    item: React.PropTypes.object.isRequired,
    loadSpec: React.PropTypes.func.isRequired,
    loadSpecXml: React.PropTypes.func.isRequired,
    loadComments: React.PropTypes.func.isRequired,
    deleteComment: React.PropTypes.func.isRequired,
    saveComment: React.PropTypes.func.isRequired,
    spec: React.PropTypes.object,
    specXml: React.PropTypes.string,
    comments: React.PropTypes.array.isRequired,
    newComment: React.PropTypes.string,
    loggedIn: React.PropTypes.bool,
    expansionState: React.PropTypes.object.isRequired,
    linkedComponents: React.PropTypes.object.isRequired,
    onComponentToggle: React.PropTypes.func,
    loading: React.PropTypes.bool.isRequired
  },

  render: function () {
    var item = this.props.item;
    if(item == null) {
      return null;
    }
    var xmlElement = null;
    var viewer = null;

    var isProfile = ComponentSpec.isProfile(item);
    var classes = classNames("componentInfoPanel", {"loading": this.props.loading, "profile": isProfile, "component": !isProfile});
    var loadingSpinner = <div className="loader spinner-loader">Loading...</div>;

    return (
      <Tabs activeKey={this.props.activeView} onSelect={this.refreshTab} className={classes}>
        <Tab eventKey={Constants.INFO_VIEW_SPEC} title="view" disabled={this.props.loading}>
          {loadingSpinner}
          {this.props.spec != null && <ComponentSpecView
            spec={this.props.spec}
            onComponentToggle={this.props.onComponentToggle}
            expansionState={this.props.expansionState}
            linkedComponents={this.props.linkedComponents}
            />}
        </Tab>
        <Tab id="xmlTab" eventKey={Constants.INFO_VIEW_XML} title="xml" disabled={this.props.loading}>
          {loadingSpinner}
          {(this.props.specXml != null) &&
            <XmlPanel xml={this.props.specXml} />
          }
        </Tab>
        <Tab id="commentsTab" eventKey={Constants.INFO_VIEW_COMMENTS} title={"Comments (" + this.getCommentsCount() + ")"} disabled={this.props.loading}>
          {loadingSpinner}
          {this.props.item != null &&
            <Comments
              item={this.props.item}
              loggedIn={this.props.loggedIn}
              newComment={this.props.newComment}
              comments={this.props.comments}
              saveComment={this.props.saveComment}
              deleteComment={this.props.deleteComment}
              />}
        </Tab>
      </Tabs>
    );
  },

  getCommentsCount: function() {
    if(this.props.activeView == Constants.INFO_VIEW_COMMENTS) {
      // most accurate IF the current tab is the comments tab (which means that the comments have been loaded)
      return this.props.comments.length;
    } else {
      // we got this from the item listing
      return this.props.item.commentsCount;
    }
  },

  refreshTab: function(index) {
    // do a reload depending on selected tab
    if(index === Constants.INFO_VIEW_SPEC) {
      this.props.loadSpec();
    }
    if(index === Constants.INFO_VIEW_XML) {
      this.props.loadSpecXml();
    }
    if(index == Constants.INFO_VIEW_COMMENTS) {
      this.props.loadComments();
    }
  }
});

module.exports = InfoPanel;
