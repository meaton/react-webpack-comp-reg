/**
 * @jsx React.DOM
 */

'use strict';

var DataTablesRow = require('./DataTablesRow.jsx');
var React = require('react');

var DataTablesGrid = React.createClass({
  getInitialState: function() {
    return {data:[], multipleSelect: true, selectedItem: null };
  },
  componentWillMount: function(){
 		$.ajax({
      url: 'http://localhost:8080/ComponentRegistry/rest/registry/components',
      accepts: {
        json: 'application/json'
      },
      dataType: 'json',
      success: function(data) {
        this.setState({data: data.componentDescription});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
 	},
 	componentDidMount: function(){
 		var self = this;
 		$('#' + this.getDOMNode().id).dataTable({
           "scrollY": "600px",
           "scrollCollapse": true,
           "paging": false,
           "destroy": true,
		  "drawCallback": function(settings) {
        self.forceUpdate();
      }
		});
 	},
 	componentDidUpdate: function(){
     console.log('did update');
     if(this.state.selectedItem == null)
      $('#' + this.getDOMNode().id).dataTable({
             "scrollY": "600px",
             "scrollCollapse": true,
             "paging": false,
             "destory": true
      });
 	},
  rowClick: function(val) {
    //var target = event.target;
    console.log('row click: ' + val);

    var currentItem = this.state.selectedItem;

    if(currentItem == null)
      this.state.selectedItem = val;
    else if(!this.state.multipleSelect) {
      currentItem.setState({selectedItem: null});
      this.state.selectedItem = val;
    }

    //this.setState({selectedItem: val});
  },
 	render: function(){
     console.log('render');
     var self = this;

 	   var x = this.state.data.map(function(d, index){
 			return ( <DataTablesRow data={d} key={d.id} multipleSelect={self.state.multipleSelect} onClick={self.rowClick}></DataTablesRow> );
     });

		 if(this.state.data.length > 0) return (
			<table className="table table-striped" id="testtable">
				<thead>
					<tr>
            <td></td>
						<td>Name</td>
						<td>Group Name</td>
            <td>Domain Name</td>
            <td>Creator</td>
            <td>Description</td>
            <td>Registration Date</td>
            <td>Comments</td>
					</tr>
				</thead>
				<tbody>
					{x}
				</tbody>
			</table>
		)
    else
      return <div>empty</div>
 	}
 });

module.exports = DataTablesGrid;
