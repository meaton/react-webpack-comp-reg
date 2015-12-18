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
  //
  // componentDidMount: function() {
  //   // component appears for the first time, load the current tab
  //   this.refreshTab(this.props.activeView);
  // },
  //
  // shouldComponentUpdate: function(nextProps, nextState) {
  //   // component props have been updated, could be an item change
  //   if(getId(this.props.item) != getId(nextProps.item)) {
  //     // item changed, reload current tab
  //     log.trace("Item changed!", this.props.item, nextProps.item);
  //     this.refreshTab(this.props.activeView);
  //     // don't update now, reload should already trigger an update
  //     return false;
  //   } //else something else has changed, update normally
  //
  //   return true;
  // },

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
            <pre><code ref="xmlcode" className="language-markup">{formatXml(this.props.specXml.substring(55))}</code></pre>
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

/* GIST kurtsson/3f1c8efc0ccd549c9e31 */
function formatXml(xml) {
  var formatted = '';
  var reg = /(>)(<)(\/*)/g;
  xml = xml.toString().replace(reg, '$1\r\n$2$3');
  var pad = 0;
  var nodes = xml.split('\r\n');
  for(var n in nodes) {
    var node = nodes[n];
    var indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    var padding = '';
    for (var i = 0; i < pad; i++) {
      padding += '  ';
    }

    formatted += padding + node + '\r\n';
    pad += indent;
  }
  return formatted; //.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g, '&nbsp;');
}

function getId(item) {
  if(item == null) {
    return null;
  } else {
    return item.id;
  }
}

module.exports = InfoPanel;
