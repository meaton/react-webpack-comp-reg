'use strict';

var log = require('loglevel');

var React = require('react'),
    Constants = require("../../constants");

var moment = require('moment-timezone');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var ButtonInput = require('react-bootstrap/lib/ButtonInput');
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');
var Panel = require('react-bootstrap/lib/Panel');

//components
var ComponentSpecView = require('./ComponentSpecView');

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

  getInitialState: function() {
    return {comment: ''};
  },

  componentDidMount: function() {
    // component appears for the first time, load the current tab
    this.refreshTab(this.props.activeView);
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    // component props have been updated, could be an item change
    if(getId(this.props.item) != getId(nextProps.item)) {
      // item changed, reload current tab
      log.trace("Item changed!", this.props.item, nextProps.item);
      this.refreshTab(this.props.activeView);
      // don't update now, reload should already trigger an update
      return false;
    } //else something else has changed, update normally

    if(this.props.newComment != nextProps.newComment) {
      this.setState({comment: nextProps.newComment});
    }

    return true;
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
  },

  render: function () {
    var item = this.props.item;
    var xmlElement = null;
    var viewer = null;

    if(this.props.spec == null)
      return null;
    else
      viewer = (
        <ComponentSpecView
          spec={this.props.spec}
          onComponentToggle={this.props.onComponentToggle}
          expansionState={this.props.expansionState}
          linkedComponents={this.props.linkedComponents}
          />
      );

    // comments form and submission
    var commentsForm = (this.props.loggedIn) ? (
      <form name="commentsBox" onSubmit={this.saveComment}>
        <Input onChange={this.handleChangeComment} ref="commentText" value={this.state.comment} id="commentText" type='textarea' label='Add Comment' placeholder='' cols="30" rows="5" />
        <ButtonInput type='submit' value='Submit' />
      </form>
    ) : (
      <p className="loginToPost">Login to enter a comment</p>
    );

    var commentsCount;
    if(this.props.activeView == Constants.INFO_VIEW_COMMENTS) {
      // most accurate IF the current tab is the comments tab (which means that the comments have been loaded)
      commentsCount = this.props.comments.length;
    } else {
      // we got this from the item listing
      commentsCount = this.props.item.commentsCount;
    }

    var isProfile = ComponentSpec.isProfile(item);
    var classes = classNames("componentInfoPanel", {"loading": this.props.loading, "profile": isProfile, "component": !isProfile});
    var loadingSpinner = <div className="loader spinner-loader">Loading...</div>;

    return (
      <Tabs activeKey={this.props.activeView} onSelect={this.refreshTab} className={classes}>
        <Tab eventKey={Constants.INFO_VIEW_SPEC} title="view" disabled={this.props.loading}>
          {loadingSpinner}
          {viewer}
        </Tab>
        <Tab id="xmlTab" eventKey={Constants.INFO_VIEW_XML} title="xml" disabled={this.props.loading}>
          {loadingSpinner}
          {(this.props.specXml != null) ?
          <pre><code ref="xmlcode" className="language-markup">{formatXml(this.props.specXml.substring(55))}</code></pre>
            : null }
        </Tab>
        <Tab id="commentsTab" eventKey={Constants.INFO_VIEW_COMMENTS} title={"Comments (" + commentsCount + ")"} disabled={this.props.loading}>
          {loadingSpinner}
          {this.renderComments()}
          {commentsForm}
        </Tab>
      </Tabs>
    );
  },

  renderComments: function() {
    var comments = this.props.comments;
    var isLoggedIn = this.props.loggedIn;
    var commentDelete = this.deleteComment;

    if(comments != null && comments.length > 0)
      return (
        comments.map(function(comment, index) {
          var deleteLink = (isLoggedIn && comment.canDelete === "true" && comment.id != null) ? (
            <span>&nbsp;<a className="delete" onClick={commentDelete.bind(this, comment)}>[delete]</a></span>
          ) : null;

          return (
            <div key={"comment-" + index} className="comment">
              <span className="comment-name">{comment.userName}
              </span><span> - </span>
              <span className="comment-date">{ (comment.commentDate == null) ? null: moment(comment.commentDate).format('LLL') }</span>
              {deleteLink}
              <p className="comment-comments">{comment.comments}</p>
            </div>
          );
        }.bind(this))
      );
    else
      return React.createElement('div', {className: "comment empty"}, "No Comments");
  },

  handleChangeComment: function(evt) {
    this.setState({comment: evt.target.value});
  },

  saveComment: function(evt) {
    evt.preventDefault();
    log.debug("Post comment", this.state.comment);
    this.props.saveComment(this.state.comment);
  },

  deleteComment: function(comment) {
    log.debug("Delete comment", comment.id, comment);
    this.props.deleteComment(comment.id);
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
