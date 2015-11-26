'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* DataTablesRow - manages the table-row selection state and display of the table-rows in the DataTablesGrid.
* @constructor
*/
var DataTablesRow = React.createClass({
  mixins: [ImmutableRenderMixin],
  
  propTypes: {
    data: React.PropTypes.object.isRequired,
    multiple: React.PropTypes.bool.isRequired,
    selected: React.PropTypes.bool.isRequired,
    rowSelectAllowed: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    className: React.PropTypes.string
  },
  getDefaultProps: function() {
    return { buttonBefore: false, className: "unknown", rowSelectAllowed: true };
  },
  rowClick: function(val, evt) {
    evt.stopPropagation();
    this.props.onClick(val, this);
  },
  buttonClick: function(evt) {
    //TODO: handle add button event
    evt.stopPropagation();
    evt.currentTarget.blur();

    var rowId = this.props.data.id;
    this.rowClick(rowId, evt);
  },
  render: function(){
    var data = this.props.data;

    // if multiple select, add a checkbox to visually indicate this mode - notice there's no event handler because the change bubbles up to the row click event
    var checkbox = (this.props.multiple) ? <td className="checkboxCell"><input type="checkbox" name="componentCb" value={this.props.data.id} checked={(this.props.selected) ? "checked" : ""} /></td> : null;
    var buttonBefore = (this.props.buttonBefore) ? (
      <td className="add">
        <Button
          ref="addButton"
          title="Click to link this component to the seleceted component in the editor"
          onClick={this.buttonClick}
          disabled={!this.props.rowSelectAllowed}>+</Button>
      </td>): null;

    //TODO: parse registration date
    var registrationDate = data.registrationDate.substr(0,10);
    return (
      <tr onClick={this.props.buttonBefore ? null : this.rowClick.bind(this, this.props.data)} key={this.props.data.id} className={(this.props.selected) ? "selected " + this.props.className : this.props.className}>
        {checkbox}
        {buttonBefore}
        <td className="name">{data.name}</td>
        <td className="groupName">{data.groupName}</td>
        <td className="domainName">{data.domainName}</td>
        <td className="creatorName">{data.creatorName}</td>
        <td className="description">{data.description}</td>
        <td className="registrationDate">{registrationDate}</td>
        <td className="commentsCount">{data.commentsCount}</td>
      </tr>
    )
  }
});

module.exports = DataTablesRow;
