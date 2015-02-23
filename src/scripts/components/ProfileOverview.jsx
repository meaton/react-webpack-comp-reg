/** @jsx React.DOM */

'use strict';

var React = require('react');
var Config = require('../config.js');

/** Bootstrap components */
var InfoPanel = require('./InfoPanel.jsx');

var ProfileOverview = React.createClass({
  propTypes: {
    profileId: React.PropTypes.string
  },
  getInitialState: function() {
    return {profile: null, visible: false};
  },
  loadProfile: function(profileId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + profileId,
      dataType: 'json',
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        this.setState({profile: data, visible: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    if(this.props.profileId != null)
      this.loadProfile(this.props.profileId);
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.profileId != null)
      this.loadProfile(nextProps.profileId);
    else this.setState({visible: false});
  },
  render: function() {
    var hideClass = (!this.state.visible) ? "hide" : "show";

    return (
      <div className={hideClass}>
        <InfoPanel item={this.state.profile} />
      </div>
    );
  }
});

module.exports = ProfileOverview;
