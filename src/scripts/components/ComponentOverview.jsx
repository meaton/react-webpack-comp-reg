'use strict';

var React = require('react');

//mixins
var ComRegLoader = require('../mixins/Loader');
var LoadingMixin = require('../mixins/LoadingMixin');

//bootstrap
var InfoPanel = require('./InfoPanel');

var ComponentOverview = React.createClass({
  mixins: [ComRegLoader, LoadingMixin],
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
    this.setLoading(true);
    this.loadComponent(this.props.componentId, "text", function(data) {
      self.setState({component_xml: data, visible: true});
    });
  },
  componentWillReceiveProps: function(nextProps) {
    var self = this;
    if(nextProps.componentId && (this.props.componentId != nextProps.componentId)) {
      this.setState({ component: null, component_xml: null, comments: null}, function(state, props) {
        self.setLoading(true);

        self.loadComponent(nextProps.componentId, "json", function(data) {
          self.setState({component: data, visible: true});
        });

        self.loadComments(nextProps.componentId, false, function(comments) {
          self.setState({comments: comments});
        });
      });
    } else if(nextProps.componentId == null)
      this.setState({visible: false});
  },
  componentDidMount: function() {
    var self = this;
    if(this.props.componentId) {
      self.setLoading(true);

      self.loadComponent(this.props.componentId, "json", function(data) {
        self.setState({component: data, visible: true});
      });

      self.loadComments(this.props.componentId, false, function(comments) {
        self.setState({comments: comments});
      });
    }
  },
  render: function() {
    var hideClass = (!this.state.visible) ? "hide" : "show";
    var infoPanel = (this.state.component != null) ? <InfoPanel item={this.state.component} load_data={this.loadComponentXml} xml_data={this.state.component_xml} comments_data={this.state.comments} /> : null;
    return (
      <div className={hideClass}>
        {infoPanel}
      </div>
    );
  }
});

module.exports = ComponentOverview;
