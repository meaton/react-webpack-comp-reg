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
    onClick: React.PropTypes.function
  },
  getInitialState: function() {
    return {active: false };
  },
  getDefaultProps: function() {
    return { multiple: false, buttonBefore: false };
  },
  rowClick: function(val, evt) {
    var dgSelect = this.props.onClick;
    var target = evt.currentTarget;
    var chkVal = (this.props.multiple) ? !this.props.selected : true;

    console.log('row click: ' + val);
    console.log('chkval: ' + chkVal);

    this.setState({selected: chkVal}, function() {
      if(chkVal) dgSelect(val, this, this.state.active);
      else dgSelect(null, this);
    });
  },
  buttonClick: function(evt) {
    evt.stopPropagation();
    evt.currentTarget.blur();

    var rowClick = this.rowClick;
    var rowId = this.props.data.id;
    this.setState({ active: true }, function() { rowClick(rowId, evt); });
  },
  componentWillReceiveProps: function(nextProps) {
    //console.log(this.constructor.displayName, 'received props row: ', JSON.stringify(this.props));
    if(this.props.multiple != nextProps.multiple)
      this.setState({ selected: false });
    if(this.props.selected != nextProps.selected)
      this.setState({ selected: nextProps.selected });
  },
  componentDidUpdate: function() {
    if(this.refs.addButton) {
      if(this.refs.addButton.props.active && this.props.selected) {
        console.log('add button is active: ' + this.refs.addButton.props.active, this.props.selected);
        this.props.onClick(this.props.data.id, this, true);
      }
    }
  },
  componentDidMount: function() {
    if(this.props.selected) {
      console.log('row selected on mount: ' + this.props.data.id);
      this.props.onClick(this.props.data.id, this);
    }
  },
  render: function(){
    var data = this.props.data;
    var button = (this.state.active) ? <Button ref="addButton" onClick={this.buttonClick} active>+</Button> : <Button ref="addButton" onClick={this.buttonClick}>+</Button>;
    var checkbox = (this.props.multiple) ? <td><input type="checkbox" name="componentCb" value={this.props.data.id} onChange={this.rowClick.bind(this, this.props.data.id)} checked={(this.props.selected) ? "checked" : ""} /></td> : null;
    var buttonBefore = (this.props.buttonBefore) ? <td className="add">{button}</td> : null;

    return (
      <tr onClick={this.rowClick.bind(this, this.props.data.id)} key={this.props.data.id} className={(this.props.selected) ? "selected " + this.props.className : this.props.className}>
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
