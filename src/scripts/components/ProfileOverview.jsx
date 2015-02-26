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
    return {profile: null, profile_xml: null, comments: null, visible: false};
  },
  loadProfile: function(profileId, raw_type) {
    var type = (raw_type != undefined || raw_type == "json") ? "/" + raw_type : "";
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + profileId,
      dataType: (raw_type != undefined) ? raw_type : "json",
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        if(raw_type != undefined && raw_type != "json")
          this.setState({profile_xml: data, visible: true});
        else
          this.setState({profile: data, comments: this.state.comments, visible: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId, status, err.toString());
      }.bind(this)
    });

    if(this.state.comments == null)
      this.loadComments(profileId);
  },
  loadComments: function(profileId) {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + profileId + '/comments',
      dataType: "json",
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
          if(data != null)
            this.setState({comments: data.comment});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(profileId, status, err.toString());
      }.bind(this)
    });
  },
  loadProfileXml: function() {
    this.loadProfile(this.props.profileId, "text");
  },
  componentDidMount: function() {
    if(this.props.profileId != null)
      this.loadProfile(this.props.profileId);
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.profileId != null) {
        if(nextProps.profileId != this.props.profileId) {
          this.state.comments = null;
          this.state.profile_xml = null;

          this.loadProfile(nextProps.profileId);
        }
    } else
      this.setState({visible: false});
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
