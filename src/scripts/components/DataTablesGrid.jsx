/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var DataTablesRow = React.createFactory(require('./DataTablesRow.jsx'));
var Config = require('../config.js');

//require('../../styles/DataGrid.sass');

var DataTablesWrapper = React.createClass({
  getInitialState: function() {
    return { rows: [], redraw: false }
  },
  componentDidMount: function() {
    var self = this;

    $('#' + this.getDOMNode().id).on( 'draw.dt', function () {
      console.log( 'Redraw occurred at: ' + new Date().getTime() );
      self.state.redraw = false;
    });
  },
  updateRows: function() {
    //TODO: update and draw of row state still not working with filtered results, likely destroy of table req, alt opt implement own search/filter feature in React component
    console.log("child len: " + this.props.children.length);

    var rows = this.state.rows;
    return React.Children.map(this.props.children, function(child) {
        if(DataTablesRow.type == child.type) {

          if(rows != null && rows.length > 0)
            rows.each(function(index, row) {
              var data_id = $(row).data().reactid;
              var match = (data_id.indexOf(child.key.substring(child.key.lastIndexOf("_"), child.key.length)) != -1);

              if(match) {
                console.log("row react-id: " + data_id);
                console.log("match: " + match);

                var clone = React.addons.cloneWithProps(child, { selected: false, key: child.key });
                return clone;
              }
            });

          return child;

        } else
          return child;
    }.bind(this));
  },
  render: function() {
    console.log('render wrapper');
    return (
      <table className="table table-striped" id="testtable">
        <thead>
          <tr>
            {(this.props.multiple) ? <td/> : null}
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
          {this.updateRows()}
        </tbody>
      </table>
    );
  }
});

var DataTablesGrid = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  propTypes: {
    multiple:  React.PropTypes.shape({
      value: React.PropTypes.bool.isRequired,
      requestChange: React.PropTypes.func.isRequired
    }),
    type: React.PropTypes.string,
    filter: React.PropTypes.string, // published / private / group?
    component: React.PropTypes.func,
    profile: React.PropTypes.func
  },
  getInitialState: function() {
    return {data:[], currentFilter: this.props.filter, currentType: this.props.type, multiSelect: this.props.multiple.value, lastSelectedItem: null };
  },
  loadData: function(nextFilter, nextType) {
    var type = (nextType != null) ? nextType.toLowerCase() : this.props.type.toLowerCase();

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

       this.setState({data: (_data != null) ? _data : [], currentFilter: this.props.filter, currentType: this.props.type, lastSelectedItem: null});
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
 		// note: data currently loaded after component mount not provided on init
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

    if(this.props.multiple.value != nextState.multiSelect) {
      return true;
    } else if(nextProps.filter == nextState.currentFilter && nextProps.type == nextState.currentType)
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
     $('#' + this.refs.wrapper.getDOMNode().id).show();
     var table = $('#' + this.refs.wrapper.getDOMNode().id).DataTable({
         "autoWidth": false,
         "scrollY": "300px",
         "scrollCollapse": true,
         "paging": false,
         "destroy": true,
       });

      table.on('search.dt', function(e, settings) {
        console.log('search event: ' + e);

        //TODO rewrite for mult-select mode
        var filtered = table.$('tr.selected', { "filter": "applied" });
        var selected = table.$('tr.selected');

        console.log('applied: ' + filtered.size());
        console.log('selected: ' + selected.size());
        console.log('all applied: ' + !(filtered.size() < selected.size()));

        if(filtered.size() < selected.size()) {
          var not_selected = selected.not(function(idx, elem) {
            console.log("idx: " + idx);
            console.log("filtered:" + filtered.size());
            console.log(filtered.toArray());

            if($.isArray(filtered.toArray()))
              return !$.inArray(elem, filtered.toArray());
            else
              return true;

          });

          not_selected.each(function(i, row) {
            console.log('deselect: ' +  table.row(row).index());

            if(!self.state.multiSelect && self.state.lastSelectedItem != row) {
              console.log('match to be deselect');
              self.state.lastSelectedItem.setState({selected: false});
              self.state.lastSelectedItem = null;

              self.props.profile(null);
            }
          });

          console.log('redraw state: ' + self.refs.wrapper.state.redraw);

          if(self.state.multiSelect && !self.refs.wrapper.state.redraw)
            self.refs.wrapper.setState({ rows: not_selected });
        }

        /*
        if(self.state.lastSelectedItem != null) {
          var row = table.row(self.state.lastSelectedItem.getDOMNode());
          if(row != null) {
            var data = row.data();
            console.log('selected row: ' + row.index());

            self.state.lastSelectedItem.setState({lastSelectedItem: null});
            self.state.lastSelectedItem = null;

            self.props.profile(null);
          }
        }
        */
      });
 	},
  rowClick: function(val, target) {
    var currentItem = this.state.lastSelectedItem;
    if(currentItem != null && !this.state.multiSelect)
      currentItem.setState({selected: false});

    if(this.state.currentType == "profiles")
      this.props.profile(val);
    else if(this.state.currentType == "components")
      this.props.component(val);

    this.state.lastSelectedItem = target;
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('next props: ' + nextProps.multiple.value + ' ' + this.props.multiple.value);
    if(this.props.multiple.value != nextProps.multiple.value) {
      console.log('change state multiSelect : ' + this.state.multiSelect);
      this.setState({multiSelect: nextProps.multiple.value, lastSelectedItem: null});
    }
  },
 	render: function(){
     console.log('render');

     var self = this;
 	   var x = this.state.data.map(function(d, index){
 			return (
         <DataTablesRow data={d} key={d.id} multiple={self.state.multiSelect} onClick={self.rowClick} selected={false} className={(index+1 % 2) ? "odd" : "even"} ></DataTablesRow>
      );
     });

		 return (
       <DataTablesWrapper ref="wrapper" multiple={this.state.multiSelect} >
        {x}
       </DataTablesWrapper>
		);
 	}
 });

module.exports = DataTablesGrid;
