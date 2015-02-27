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
    this.loadProfile(this.props.profileId, "text");
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('received profile props');
    if(nextProps.profileId != null) {
        if(nextProps.profileId != this.props.profileId) {
          this.state.comments = null;
          this.state.profile_xml = null;

          this.loadProfile(nextProps.profileId);
        }
    } else
      this.setState({visible: false});
  },
  componentWillUpdate: function(nextProps, nextState) {
      if(nextState.comments == null && nextState.visible)
        this.loadComments(this.props.profileId, true);
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
