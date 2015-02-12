/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var DataTablesRow = require('./DataTablesRow.jsx');
var Config = require('../config.js');

//require('../../styles/DataGrid.sass');

var DataTablesGrid = React.createClass({
  propTypes: {
    multiple: React.PropTypes.bool,
    type: React.PropTypes.string,
    filter: React.PropTypes.string, // published / private / group?
    component: React.PropTypes.func,
    profile: React.PropTypes.func
  },
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
     username: Config.auth.username,
     password: Config.auth.password,
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
 		/*var self = this;
 		var table = $('#' + this.getDOMNode().id).DataTable({
       "autoWidth": false,
       "scrollY": "600px",
       "scrollCollapse": true,
       "paging": false,
       "destroy": true,
		   "drawCallback": function(settings) {
         self.forceUpdate();
       }
		}).on('search.dt', function(e, settings) {
      console.log('(mount) search event: ' + e);
    });*/
 	},
  shouldComponentUpdate: function(nextProps, nextState) {
    console.log('filter: ' + nextProps.filter);
    console.log('currentFilter: ' + nextState.currentFilter);

    if(nextProps.filter == nextState.currentFilter && nextProps.type == nextState.currentType)
      return !$.fn.dataTable.isDataTable('#' + this.getDOMNode().id);
    else {
      $('#' + this.getDOMNode().id).hide();
      $('#' + this.getDOMNode().id).DataTable().destroy();
      this.loadData(nextProps.filter, nextProps.type);
    }

    return false;
  },
 	componentDidUpdate: function(){
     console.log('did update');
     var self = this;
     $('#' + this.getDOMNode().id).show();
     var table = $('#' + this.getDOMNode().id).DataTable({
         "autoWidth": false,
         "scrollY": "600px",
         "scrollCollapse": true,
         "paging": false,
         "destroy": true,
      });

      table.on('search.dt', function(e, settings) {
        console.log('search event: ' + e);
        if(self.state.selectedItem != null) {
          var row = table.row(self.state.selectedItem.getDOMNode());
          var data = row.data();
          console.log('selected row: ' + row.index());
          var containsSelected = table.$('tr.selected', { "filter": "applied" }).size() > 0;
          if(!containsSelected) {
            self.state.selectedItem.setState({selectedItem: null});
            self.state.selectedItem = null;
          }
        }
      });
 	},
  rowClick: function(val, target) {
    //var target = event.target;
    console.log('row click: ' + val);
    var currentItem = this.state.selectedItem;

    if(currentItem == null)
      this.state.selectedItem = target;
    else if(!this.state.multipleSelect) {
      currentItem.setState({selectedItem: null});
      this.state.selectedItem = target;
    }

    if(this.state.currentType == "profiles")
      this.props.profile(val);
    else if(this.state.currentType == "components")
      this.props.component(val);
    //this.setState({selectedItem: val});
  },
 	render: function(){
     console.log('render');
     var self = this;

 	   var x = this.state.data.map(function(d, index){
 			return (
         <DataTablesRow data={d} key={d.id} multiple={self.state.multipleSelect} onClick={self.rowClick} className={(index+1 % 2) ? "odd" : "even"} ></DataTablesRow>
      );
     });

     var checkboxCol = (this.state.multipleSelect) ? <td/> : null;

		 if(this.state.data.length > 0) return (
			<table className="table table-striped" id="testtable">
				<thead>
					<tr>
            {checkboxCol}
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
