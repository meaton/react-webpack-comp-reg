'use strict';

var React = require('react');
var Router = require('react-router');

var CompRegLoader = require('../mixins/Loader');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  mixins: [Router.State, CompRegLoader],
  getInitialState: function() {
    return { profile: null, component: null };
  },
  componentWillMount: function() {
    this.props.profileId = this.getParams().profile;
    this.props.componentId = this.getParams().component;
  },
  render: function () {
    var item = (this.props.item != undefined && this.props.item != null) ? this.props.item : (this.state.profile || this.state.component);

    //TODO: Component hierarcy
    if(item == null)
      return (
        <div className="ComponentViewer loading">Loading...</div>
      );

    var conceptLink = (item.CMD_Component != undefined && item.CMD_Component["@ConceptLink"] != null) ? <li><span>ConceptLink:</span> <a href={item.CMD_Component["@ConceptLink"]}>{item.CMD_Component["@ConceptLink"]}</a></li> : null;
    var list = (<ul>
      <li><span>Name:</span> <b>{item.Header.Name}</b></li>
      <li><span>Description:</span> {item.Header.Description}</li>
      {conceptLink}
    </ul>);

    return (
    <div className="ComponentViewer">{list}</div>
    );
  }
});

module.exports = ComponentViewer;
