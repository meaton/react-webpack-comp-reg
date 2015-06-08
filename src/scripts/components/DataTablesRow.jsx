'use strict';

var React = require('react');
var Button = require('react-bootstrap/lib/Button');

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
  rowClick: function(val, event) {
    var dgSelect = this.props.onClick;
    var target = event.currentTarget;
    var chkVal = (this.props.multiple) ? !this.state.selected : true;

    console.log('row click: ' + val);
    console.log('chkval: ' + chkVal);

    this.setState({selected: chkVal}, function() {
      if(chkVal) dgSelect(val, this);
      else dgSelect(null, this);
    });
  },
  buttonClick: function(evt) {
    evt.currentTarget.blur();
    this.setState({active: true});
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('received props row: ' +  this.props.multiple);
    if(this.props.multiple != nextProps.multiple)
        this.setState({selected: false});

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
        <td>{data.name}</td><td>{data.groupName}</td><td>{data.domainName}</td><td>{data.creatorName}</td><td>{data.description}</td><td>{data.registrationDate}</td><td>{data.commentsCount}</td>
      </tr>
    )
  }
});

module.exports = DataTablesRow;
