/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

var DataTablesRow = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    multiple: React.PropTypes.bool
  },
  getInitialState: function() {
    return {data: this.props.data, selectedItem: null };
  },
  rowClick: function(val, event) {
    //event.preventDefault();
    var target = event.currentTarget;

    var chkVal = (this.props.multiple && this.state.selectedItem != null) ? false : true;
    $(':checkbox[value="' + val + '"]').prop('checked', chkVal);

    console.log('row click: ' + val);

    this.props.onClick(val, this);
    this.setState({selectedItem: (chkVal) ? val : null});
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    var cbSelect = $(':checkbox[value="' + this.state.selectedItem + '"]');

    if(!this.props.multiple && nextState.selectedItem != this.state.selectedItem) cbSelect.prop('checked', false);
    else if(nextState.selectedItem == null) cbSelect.prop('checked', false);

    return true;
  },
  render: function(){
    var data = this.state.data;
    var checkbox = (this.props.multiple) ? <td><input type="checkbox" name="componentCb" value={this.state.data.id} onClick={this.rowClick.bind(null, this.state.data.id)} /></td> : null;
    return (
      <tr onClick={this.rowClick.bind(null, this.state.data.id)} key={this.state.data.id} className={(this.state.selectedItem == data.id) ? "selected" : ""}>
        {checkbox}
        <td>{data.name}</td><td>{data.groupName}</td><td>{data.domainName}</td><td>{data.creatorName}</td><td>{data.description}</td><td>{data.registrationDate}</td><td>{data.commentsCount}</td>
      </tr>
    )
  }
});

module.exports = DataTablesRow;
