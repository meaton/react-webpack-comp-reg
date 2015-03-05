'use strict';

var React = require('react');
var CompRegLoader = require('../mixins/Loader');

/** Bootstrap components */
var InfoPanel = require('./InfoPanel.jsx');

var ProfileOverview = React.createClass({
  mixins: [CompRegLoader],
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
    this.loadProfile(this.props.profileId, "text", function(data) {
        self.setState({profile_xml: data, visible: true});
    });
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('received profile props');
    var self = this;
    if(nextProps.profileId != null && (nextProps.profileId != this.props.profileId)) {
        this.state.comments = null;
        this.state.profile_xml = null;

        this.loadProfile(nextProps.profileId, "json", function(data) {
          self.setState({profile: data, visible: true});
        });

        this.loadComments(nextProps.profileId, true, function(comments) {
          self.setState({comments: comments});
        });
    } else
      this.setState({visible: false});
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('profile overview update');
  },
  render: function() {
    var hideClass = (!this.state.visible) ? "hide" : "show";
    return (
      <div className={hideClass}>
        <InfoPanel item={this.state.profile} load_data={this.loadProfileXml} xml_data={this.state.profile_xml} comments_data={this.state.comments} />
      </div>
    );
  }
});

module.exports = ProfileOverview;
