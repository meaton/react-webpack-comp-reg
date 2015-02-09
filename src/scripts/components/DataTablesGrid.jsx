/**
 * @jsx React.DOM
 */

'use strict';

var DataTablesRow = require('./DataTablesRow.jsx');
var React = require('react');

var DataTablesGrid = React.createClass({
  getInitialState: function() {
    return {data:[], currentFilter: this.props.filter, currentType: this.props.type, multipleSelect: this.props.multiple, selectedItem: null };
  },
  loadData: function(nextFilter, nextType) {
    var type = (nextType != null) ? nextType : this.props.type;

    $.ajax({
     url: 'http://localhost:8080/ComponentRegistry/rest/registry/' + type,
     accepts: {
       json: 'application/json'
     },
     data: { unique: new Date().getTime(), registrySpace: (nextFilter != null) ? nextFilter: this.props.filter },
     dataType: 'json',
     username: "seaton",
     password: "compreg",
     xhrFields: {
       withCredentials: true
     },
     success: function(data) {
       var _data = data;
       if(_data != null) {
          if(_data.hasOwnProperty("componentDescription") && type == "components")
            _data = data.componentDescription;
          else if(_data.hasOwnProperty("profileDescription") && type == "profiles")
            _data = data.profileDescription;

          if(!$.isArray(_data))
            _data = [_data];
        }

       this.setState({data: (_data != null) ? _data : [], currentFilter: this.props.filter, currentType: this.props.type, selectedItem: null});
     }.bind(this),
     error: function(xhr, status, err) {
       console.error(status, err.toString());
     }.bind(this)
   });
 },
  componentWillMount: function(){
 		this.loadData();
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
  shouldComponentUpdate: function(nextProps, nextState) {
    console.log('filter: ' + nextProps.filter);
    console.log('currentFilter: ' + nextState.currentFilter);

    if(nextProps.filter == nextState.currentFilter && nextProps.type == nextState.currentType)
      return true;
    else {
      $('#' + this.getDOMNode().id).dataTable().fnDestroy();
      this.loadData(nextProps.filter, nextProps.type);
    }

    return false;
  },
 	componentDidUpdate: function(){
     console.log('did update');
     // TODO destroy update on new data
     if(this.state.selectedItem == null)
      $('#' + this.getDOMNode().id).dataTable({
             "scrollY": "600px",
             "scrollCollapse": true,
             "paging": false,
             "destroy": true
      });
 	},
  rowClick: function(val, event) {
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
 			return (
         <DataTablesRow data={d} key={d.id} multiple={self.state.multipleSelect} onClick={self.rowClick}></DataTablesRow>
      );
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
