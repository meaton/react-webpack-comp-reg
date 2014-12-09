/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

var Profile = React.createClass({
  getInitialState: function() {
    return {data:[]};
  },
  componentDidMount: function() {
    /*$.ajax({
      url: 'https://catalog.clarin.eu/ds/ComponentRegistry/rest/registry/profile/' + this.props.profileId,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.profileId, status, err.toString());
      }.bind(this)
    });*/
    this.setState({ data: [{ profile: require('../../json/profile.json'), registry: require('../../json/registry.json') }] });
  },
  render: function() {
    console.log(this.state.data);
    var regProfiles = this.state.data.map(function (dataItem) {
      return (
        <div className="profile">
          <ul>
            <li><span>Name:</span>{dataItem.profile.Header.Name}</li>
            <li><span>Group Name:</span>{dataItem.registry.groupName}</li>
            <li><span>Description:</span>{dataItem.profile.Header.Description}</li>
            <li><span>ConceptLink:</span><a href={dataItem.profile.CMD_Component["@ConceptLink"]}>{dataItem.profile.CMD_Component["@ConceptLink"]}</a></li>
          </ul>
        </div>
      );
    });

    return (
      <div className="profile_list">
        {regProfiles}
      </div>
    );
  }
});

module.exports = Profile;
