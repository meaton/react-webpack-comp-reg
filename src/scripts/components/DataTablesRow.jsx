'use strict';

var React = require('react');

var DataTablesRow = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
    multiple: React.PropTypes.bool.isRequired,
    selected: React.PropTypes.bool.isRequired
  },
  getInitialState: function() {
    return {data: this.props.data, selected: this.props.selected };
  },
  rowClick: function(val, event) {
    var target = event.currentTarget;
    var chkVal = (this.props.multiple) ? !this.state.selected : true;

    console.log('row click: ' + val);
    console.log('chkval: ' + chkVal);

    this.props.onClick(val, this);
    this.setState({selected: chkVal});
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('received props row: ' +  this.props.multiple);

    if(this.props.multiple != nextProps.multiple)
        this.setState({selected: false});
  },
  render: function(){
    //TODO: selection issue with search filtering (listen for search event and determine if any selected items are in filtered results -http://datatables.net/reference/event/search)
    var data = this.state.data;
    var checkbox = (this.props.multiple) ? <td><input type="checkbox" name="componentCb" value={this.state.data.id} onChange={this.rowClick.bind(this, this.state.data.id)} checked={(this.state.selected) ? "checked" : ""} /></td> : null;

    return (
      <tr onClick={this.rowClick.bind(this, this.state.data.id)} key={this.state.data.id} className={(this.state.selected) ? "selected " + this.props.className : this.props.className}>
        {checkbox}
        <td>{data.name}</td><td>{data.groupName}</td><td>{data.domainName}</td><td>{data.creatorName}</td><td>{data.description}</td><td>{data.registrationDate}</td><td>{data.commentsCount}</td>
      </tr>
    )
  }
});

module.exports = DataTablesRow;
