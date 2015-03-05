'use strict';

var React = require('react');
var ComRegLoader = require('../mixins/Loader');

/** Bootstrap components */
var InfoPanel = require('./InfoPanel.jsx');

var ComponentOverview = React.createClass({
  mixins: [ComRegLoader],
  propTypes: {
    componentId: React.PropTypes.string
  },
  getInitialState: function() {
    return { component: null,
             component_xml: null,
             comments: null,
             visible: false }
  },
  loadComponentXml: function() {
    var self = this;
    this.loadComponent(this.props.componentId, "text", function(data) {
      self.setState({component_xml: data, visible: true});
    });
  },
  componentWillReceiveProps: function(nextProps) {
    var self = this;
    if(nextProps.componentId && (this.props.componentId != nextProps.componentId)) {
      this.state.comments = null;
      this.state.component_xml = null;

      this.loadComponent(nextProps.componentId, "json", function(data) {
        self.setState({component: data, visible: true});
      });

      this.loadComments(nextProps.componentId, false, function(comments) {
        self.setState({comments: comments});
      });
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
