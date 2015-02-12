/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var InfoPanel = require('./InfoPanel.jsx');

var ProfileOverview = React.createClass({
  getInitialState: function() {
    return {profile: null};
  },
  loadProfile: function(profileId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + profileId,
      dataType: 'json',
      success: function(data) {
        this.setState({profile: data});
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
  },
  render: function() {
    return (
      <div className="infoPanel_wrapper">
        <InfoPanel item={this.state.profile} />
      </div>
    );
  }
});

module.exports = ProfileOverview;
