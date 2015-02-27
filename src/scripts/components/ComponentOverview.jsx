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
    this.loadComponent(this.props.componentId, "text");
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.componentId && (this.props.componentId != nextProps.componentId)) {
      this.state.comments = null;
      this.loadComponent(nextProps.componentId);
    } else
      this.setState({visible: false});
  },
  componentWillUpdate: function(nextProps, nextState) {
      if(nextState.comments == null && nextState.visible)
        this.loadComments(this.props.componentId, false);
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
