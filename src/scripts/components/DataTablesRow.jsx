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
    selected: React.PropTypes.bool.isRequired
  },
  getInitialState: function() {
    return {data: this.props.data, selected: this.props.selected, active: false };
  },
  getDefaultProps: function() {
    return { multiple: false, buttonBefore: false };
  },
  rowClick: function(val, evt) {
    var dgSelect = this.props.onClick;
    var target = evt.currentTarget;
    var chkVal = (this.props.multiple) ? !this.state.selected : true;

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
    var rowId = this.state.data.id;
    this.setState({ active: true }, function() { rowClick(rowId, evt); });
  },
  componentWillReceiveProps: function(nextProps) {
    console.log(this.constructor.displayName, 'received props row: ', JSON.stringify(this.props));
    if(this.props.multiple != nextProps.multiple)
      this.setState({ selected: false });
    if(this.state.selected != nextProps.selected)
      this.setState({ selected: nextProps.selected });
  },
  componentDidUpdate: function() {
    if(this.refs.addButton) {
      if(this.refs.addButton.props.active && this.state.selected) {
        console.log('add button is active: ' + this.refs.addButton.props.active, this.state.selected);
        this.props.onClick(this.state.data.id, this, true);
      }
    }
  },
  componentDidMount: function() {
    if(this.state.selected) {
      console.log('row selected on mount: ' + this.state.data.id);
      this.props.onClick(this.state.data.id, this);
    }
  },
  render: function(){
    var data = this.state.data;
    var button = (this.state.active) ? <Button ref="addButton" onClick={this.buttonClick} active>+</Button> : <Button ref="addButton" onClick={this.buttonClick}>+</Button>;
    var checkbox = (this.props.multiple) ? <td><input type="checkbox" name="componentCb" value={this.state.data.id} onChange={this.rowClick.bind(this, this.state.data.id)} checked={(this.state.selected) ? "checked" : ""} /></td> : null;
    var buttonBefore = (this.props.buttonBefore) ? <td className="add">{button}</td> : null;

    return (
      <tr onClick={this.rowClick.bind(this, this.state.data.id)} key={this.state.data.id} className={(this.state.selected) ? "selected " + this.props.className : this.props.className}>
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
