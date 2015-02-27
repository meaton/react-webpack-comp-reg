'use strict';

var React = require('react/addons');
var ComponentViewer = require('./ComponentViewer.jsx');
var Config = require('../config.js');

/** Bootstrap components */
var TabbedArea = require('react-bootstrap/lib/TabbedArea');
var TabPane = require('react-bootstrap/lib/TabPane');
var Panel = require('react-bootstrap/lib/Panel');

//require('../../styles/InfoPanel.sass');

var moment = require('moment-timezone');

var InfoPanel = React.createClass({
  propTypes: {
    item: React.PropTypes.object,
    load_data: React.PropTypes.func,
    xml_data: React.PropTypes.string // XMLDocument or String
  },
  getInitialState: function() {
    return { xml_data: null, comments_data: [], currentTabIdx: 0 }
  },
  tabSelect: function(index) {
    console.log('tabSelect: ' + index);

    if(index != this.state.currentTabIdx) {
      if(index == 1)
        this.props.load_data();
      this.setState({ currentTabIdx: index });
    }
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
      }
  },
  componentWillUpdate: function(nextProps, nextState) {
    if(nextState.currentTabIdx == 1 && nextProps.xml_data == null)
      this.props.load_data();
  },
  processComments: function() {
    var comments = this.state.comments_data;
    if(comments != null && comments.length > 0)
      return (
        comments.map(function(comment, index) {
          return (
            <div key={"comment-" + index} className="comment">
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
    var viewer = null;

    if(item == null)
      return null;
    else
      viewer = <ComponentViewer item={this.props.item} />;

    return (
      <TabbedArea activeKey={this.state.currentTabIdx} onSelect={this.tabSelect} className={(item['@isProfile']) ? "profile" : "component"}>
        <TabPane eventKey={0} tab="view">
          {viewer}
        </TabPane>
        <TabPane eventKey={1} tab="xml">
            {(this.state.xml_data != null) ?
            <pre><code ref="xmlcode" className="language-markup">{formatXml(this.state.xml_data.substring(55))}</code></pre>
              : "loading.." }
        </TabPane>
        <TabPane eventKey={2} tab={"Comments (" + this.state.comments_data.length + ")"}>
            {this.processComments()}
        </TabPane>
      </TabbedArea>
    );
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

module.exports = InfoPanel;
