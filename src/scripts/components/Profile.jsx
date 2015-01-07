/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

var Profile = React.createClass({
  getInitialState: function() {
    return {profile:[], registry:[]};
  },
  componentDidMount: function() {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/profiles/' + this.props.profileId,
      dataType: 'json',
      success: function(data) {
        this.setState({profile: [data]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.profileId, status, err.toString());
      }.bind(this)
    });

    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/items/' + this.props.profileId,
      dataType: 'json',
      success: function(data) {
        this.setState({registry: [data]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.profileId, status, err.toString());
      }.bind(this)
    });

    //this.setState({ data: [{ profile: require('../../json/profile.json'), registry: require('../../json/registry.json') }] });
  },
  render: function() {
    console.log(this.state.profile);
    console.log(this.state.registry);
    var currentState = this.state;
    var regProfiles = this.state.registry.map(function (registryItem) {
      return currentState.profile.map(function (profileItem) {
        return (
          <div className="profile">
            <ul>
              <li><span>Name:</span>{profileItem.Header.Name}</li>
              <li><span>Group Name:</span>{registryItem.groupName}</li>
              <li><span>Description:</span>{profileItem.Header.Description}</li>
              <li><span>ConceptLink:</span><a href={profileItem.CMD_Component["@ConceptLink"]}>{profileItem.CMD_Component["@ConceptLink"]}</a></li>
            </ul>
          </div>
        );
      });
    });

    return (
      <div className="profile_list">
        {regProfiles}
      </div>
    );
  }
});

module.exports = Profile;
