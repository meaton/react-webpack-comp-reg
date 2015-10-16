'use strict';

var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

/**
* DataTablesRow - manages the table-row selection state and display of the table-rows in the DataTablesGrid.
* @constructor
*/
var DataTablesRow = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
    multiple: React.PropTypes.bool.isRequired,
    selected: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func,
    className: React.PropTypes.string,
  },
  getInitialState: function() {
    return {active: false };
  },
  getDefaultProps: function() {
    return { multiple: false, buttonBefore: false, className: "unknown" };
  },
  rowClick: function(val, evt) {
    evt.stopPropagation();
    this.props.onClick(val, this);
  },
  buttonClick: function(evt) {
    //TODO: handle add button event
    evt.stopPropagation();
    evt.currentTarget.blur();

    var rowClick = this.rowClick;
    var rowId = this.props.data.id;
    this.setState({ active: true }, function() { rowClick(rowId, evt); });
  },
  render: function(){
    var data = this.props.data;

    // if multiple select, add a checkbox to visually indicate this mode - notice there's no event handler because the change bubbles up to the row click event
    var checkbox = (this.props.multiple) ? <td className="checkboxCell"><input type="checkbox" name="componentCb" value={this.props.data.id} checked={(this.props.selected) ? "checked" : ""} /></td> : null;

    var button = (this.state.active) ? <Button ref="addButton" onClick={this.buttonClick} active>+</Button> : <Button ref="addButton" onClick={this.buttonClick}>+</Button>;
    var buttonBefore = (this.props.buttonBefore) ? <td className="add">{button}</td> : null;

    return (
      <tr onClick={this.rowClick.bind(this, this.props.data)} key={this.props.data.id} className={(this.props.selected) ? "selected " + this.props.className : this.props.className}>
        {checkbox}
        {buttonBefore}
        <td className="name">{data.name}</td>
        <td className="groupName">{data.groupName}</td>
        <td className="domainName">{data.domainName}</td>
        <td className="creatorName">{data.creatorName}</td>
        <td className="description">{data.description}</td>
        <td className="registrationDate">{data.registrationDate}</td>
        <td className="commentsCount">{data.commentsCount}</td>
      </tr>
    )
  }
});

module.exports = DataTablesRow;
