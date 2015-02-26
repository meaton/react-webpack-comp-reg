'use strict';

var React = require('react');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  render: function () {
    var conceptLink = (this.props.item.CMD_Component["@ConceptLink"] != null) ? <li><span>ConceptLink:</span> <a href={this.props.item.CMD_Component["@ConceptLink"]}>{this.props.item.CMD_Component["@ConceptLink"]}</a></li> : null;
    var list = (<ul>
      <li><span>Name:</span> <b>{this.props.item.Header.Name}</b></li>
      <li><span>Description:</span> {this.props.item.Header.Description}</li>
      {conceptLink}
    </ul>);
    //TODO: Component hierarcy
    return (
      <div className="ComponentViewer">{list}</div>
      );
  }
});

module.exports = ComponentViewer;
