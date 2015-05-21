'use strict';

var React = require('react');
var CompRegLoader = require('../mixins/Loader');
var LoadingMixin = require('../mixins/LoadingMixin');

/** Bootstrap components */
var InfoPanel = require('./InfoPanel.jsx');

var ProfileOverview = React.createClass({
  mixins: [CompRegLoader, LoadingMixin],
  propTypes: {
    profileId: React.PropTypes.string
  },
  getInitialState: function() {
    return {
      profile: null,
      profile_xml: null,
      comments: null,
      visible: false
    };
  },
  loadProfileXml: function() {
    var self = this;
    this.setLoading(true);
    this.loadProfile(this.props.profileId, "text", function(data) {
        self.setState({profile_xml: data, visible: true});
    });
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('received profile props');
    var self = this;
    if(nextProps.profileId != null && (nextProps.profileId != this.props.profileId)) {
        this.setState({profile: null, comments: null, profile_xml: null }, function() {
          self.setLoading(true);

          self.loadProfile(nextProps.profileId, "json", function(data) {
            self.setState({profile: data, visible: true});
          });

          self.loadComments(nextProps.profileId, true, function(comments) {
            self.setState({comments: comments});
          });
        });
    } else
      this.setState({visible: false});
  },
  componentWillUpdate: function() {
    console.log('profile overview update');
  },
  render: function() {
    var hideClass = (!this.state.visible) ? "hide" : "show";
    var infoPanel = (this.state.profile != null) ? <InfoPanel item={this.state.profile} load_data={this.loadProfileXml} xml_data={this.state.profile_xml} comments_data={this.state.comments} /> : null;
    return (
      <div className={hideClass}>
        {infoPanel}
      </div>
    );
  }
});

module.exports = ProfileOverview;
