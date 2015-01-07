/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

var ComponentSpec = React.createClass({
  getInitialState: function() {
    return {data:[]};
  },
  componentDidMount: function() {
    $.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/items/' + this.props.profileId,
      dataType: 'json',
      success: function(data) {
        this.setState({data: [data]});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.profileId, status, err.toString());
      }.bind(this)
    });
    //this.setState({data: [require('../../json/registry.json')]});
  },
  render: function() {
    console.log(this.state.data);
    var regItems = this.state.data.map(function (item) {
      return (
        <div className="registry_item">
          <a href={item.href} title={item.description}>{item.name}</a>
        </div>
      );
    });

    return (
      <div className="registry_list">
        {regItems}
      </div>
    );
  }
});

module.exports = ComponentSpec;
