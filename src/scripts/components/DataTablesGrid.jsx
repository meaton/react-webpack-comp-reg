'use strict';

var React = require('react/addons');

//mixins
var CompRegLoader = require('../mixins/Loader');
var LoadingMixin = require('../mixins/LoadingMixin');

//components
var DataTablesRow = require('./DataTablesRow');

var Config = require('../config.js');

require('../../styles/DataGrid.sass');

/*
* DataTablesWrapper - outputs a HTML static table layout and header coloums for rendering by the DataTables plugin.
* @constructor
*/
var DataTablesWrapper = React.createClass({
  getInitialState: function() {
    return { rows: [], redraw: false }
  },
  componentDidMount: function() {
    var self = this;
    var id = this.getDOMNode().id;

    //TODO review resizing and height setting of datagrid scrollBody
     var resizeScrollBody = function() {
      var paddingBrowserDiv = $('.browser').innerHeight() - $('.browser').height();
      var newScrollBodyHeight = $('.main').outerHeight() - $('#' + id + '_wrapper').offset().top - $('.dataTables_scrollHead').outerHeight() - $('.dataTables_info').outerHeight() - $('.viewer').outerHeight() - paddingBrowserDiv;
      console.log('resizing dataTables scrollBody: ', newScrollBodyHeight, $('.browser').height());
      if(newScrollBodyHeight < 280) newScrollBodyHeight = 280;
      $('.dataTables_scrollBody').height(newScrollBodyHeight);
    };

    var resizeComponentViewer = function() {
      var newCompViewerHeight = $('.editor').innerHeight() - $('.ComponentViewer').offset().top + $('.btn-group').outerHeight() - $('.component-grid').outerHeight();
      console.log('resizing component viewer: ', newCompViewerHeight, $('.editor').outerHeight());
      if(newCompViewerHeight < 200) newCompViewerHeight = 200;
      $('.editor .ComponentViewer').height(newCompViewerHeight);
    };

    /*$( window ).resize(function() {
        $('#' + id).DataTable().draw();
    });

    $('#' + this.getDOMNode().id).on( 'draw.dt', function () {
      console.log( 'Redraw occurred at: ' + new Date().getTime() );
      self.state.redraw = false;
      if($('.browser').length)
        resizeScrollBody();
      else if($('.editor').length)
        resizeComponentViewer();
    });*/

  },
  /*updateRows: function() {
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
  },*/
  render: function() {
    console.log('render', this.constructor.displayName);
    return (
      <table className="table table-striped" id="testtable">
        <thead>
          <tr>
            {(this.props.multiple || this.props.editMode) ? <td/> : null}
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
          {this.props.children}
        </tbody>
      </table>
    );
  }
});

/*
* DataTablesGrid - manages the data and display or rendering of the datagrid.
* @constructor
* @mixes React.addons.LinkedStateMixin
* @mixes LoadingMixin
*/
var DataTablesGrid = React.createClass({
  mixins: [React.addons.LinkedStateMixin, CompRegLoader, LoadingMixin],
  contextTypes: {
    itemId: React.PropTypes.string
  },
  propTypes: {
    multiple: React.PropTypes.oneOfType([
      React.PropTypes.shape({
        value: React.PropTypes.bool,
        requestChange: React.PropTypes.func
      }),
      React.PropTypes.bool
    ]).isRequired,
    type: React.PropTypes.string,
    filter: React.PropTypes.string, // published / private / group?
    component: React.PropTypes.func,
    profile: React.PropTypes.func,
    editMode: React.PropTypes.bool
  },
  getInitialState: function() {
    return {data:[], currentFilter: this.props.filter, currentType: this.props.type, multiSelect: (typeof this.props.multiple === 'boolean') ? this.props.multiple : this.props.multiple.value, lastSelectedItem: null };
  },
  getDefaultProps: function() {
    return { editMode: false };
  },
  clearTable: function() {
    $('#' + this.getDOMNode().id).hide();
    $('#' + this.getDOMNode().id).DataTable().destroy();
  },
  loadItem: function(type, itemId) {
    (this.props[type] != undefined && this.props[type] != null)
      if(typeof this.props[type] === 'function') this.props[type](itemId)
  },
  removeSelected: function() {
    if(this.state.data != null && this.state.lastSelectedItem != null) {
      console.log('Removed selected items... reloading table');

      this.loadItem("profile", null);
      this.loadData(this.state.currentFilter, this.state.currentType);
    }
  },
  componentWillMount: function(){
 		 console.log(this.constructor.displayName, 'will mount: ', !this.isMounted());

     if(!this.isMounted())
       this.loadData();
 	},
  componentWillReceiveProps: function(nextProps) {
     if((this.props.multiple === 'boolean' && this.props.multiple != nextProps.multiple) ||
        (this.props.multiple.value != nextProps.multiple.value)) {
       console.log('changed state multiSelect : ' + this.state.multiSelect);
       this.setState({multiSelect: (typeof nextProps.multiple === 'boolean') ?
           nextProps.multiple :
           nextProps.multiple.value,
         lastSelectedItem: null});
     }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    /*console.log('filter: ' + nextProps.filter);
    console.log('currentFilter: ' + nextState.currentFilter);
    console.log('type: ' + nextProps.type);
    console.log('currentType:' + nextState.currentType);
    console.log('prev data:' + this.state.data.length);
    console.log('data count:' + nextState.data.length);
    console.log('datatable:' + $.fn.dataTable.isDataTable('#' + this.getDOMNode().id));
    */
    if(typeof this.props.multiple === 'boolean' && this.props.multiple != nextState.multiSelect)
      return true;
    else if(typeof this.props.multiple.requestChange === 'function' && this.props.multiple.value != nextState.multiSelect)
      return true;
    else if(nextProps.filter == nextState.currentFilter && nextProps.type == nextState.currentType) {
      console.log('filters eq:' + (this.state.data.length));
      var newData = (this.state.data.length != nextState.data.length);
      if(newData) this.clearTable();
      console.log('new data: ' + newData);
      return newData || !$.fn.dataTable.isDataTable('#' + this.getDOMNode().id);
    } else {
      this.loadData(nextProps.filter, nextProps.type);
      return false;
    }
  },
 	componentDidUpdate: function(){
     this.setLoading(false);

     var self = this;

     $('#' + this.refs.wrapper.getDOMNode().id).show();
     var table = $('#' + this.refs.wrapper.getDOMNode().id).DataTable({
         "autoWidth": true,
         "scrollY": "250px",
         "scrollCollapse": true,
         "paging": false,
         "dom": '<"#grid_toolbar">frtip',
         "destroy": true
       });

        table.one('draw.dt', function () {
          if(self.props.children) React.render(self.props.children, document.getElementById('grid_toolbar'));
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
              self.setState({ lastSelectedItem: null }, function() {
                self.loadItem("profile", null);
              });
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

      console.log('row count: ' + React.Children.count(this.refs.wrapper.props.children));
      React.Children.forEach(this.refs.wrapper.props.children, function(row) {
        if(row.props.selected) {
          console.log('selected row ' + row.key + ': ' + row.props.selected);
        }
      });
 	},
  rowClick: function(val, target, addComponent) {
    var self = this;
    var tableId = this.refs.wrapper.getDOMNode().id;
    var currentItem = this.state.lastSelectedItem;

    if(currentItem != null && currentItem != target && !this.state.multiSelect)
      currentItem.setState({selected: false, active: false});

    console.log('addComponent:' + addComponent);

    this.setState(function(state, props) {
      if(currentItem != target && !(currentItem == null && val === this.context.itemId) && target.state.selected) {
        self.loadItem(state.currentType.substr(0, state.currentType.length-1), val);
      } else if(addComponent != undefined && state.currentType == "components") {
        console.log('add component: ' + target.refs.addButton.props.active);

        self.props.component(val, target.refs.addButton.props.active);
        target.setState({ active: false });
      } else {
        var selectedRows = $('#' + tableId + ' tr.selected:first');

        if(selectedRows.length < 1)
          self.props.profile(null); //TODO find next selection item in multiple select mode
        else {
          var id = selectedRows.data().reactid;
          if(id != undefined && id.indexOf('clarin') > 0) {
            id = id.substr(id.indexOf('$')+1, id.length).replace(/=1/g, '.').replace(/=2/g, ':');
            self.loadItem(state.currentType.substr(0, state.currentType.length-1), id);
          }
        }
        return { lastSelectedItem: null };
      }

      return  { lastSelectedItem: target };
    });
  },
 	render: function(){
     console.log('render', this.constructor.displayName);

     var self = this;
     var contextItemId = this.context.itemId;
     var addButton = (this.props.editMode) ? true : false;
 	   var x = this.state.data.map(function(d, index){
 			return (
         <DataTablesRow data={d} key={d.id} multiple={self.state.multiSelect} buttonBefore={addButton} onClick={self.rowClick} selected={contextItemId != undefined && contextItemId === d.id} className={(index+1 % 2) ? "odd" : "even"} ></DataTablesRow>
      );
     });

		 return (
       <DataTablesWrapper ref="wrapper" multiple={this.state.multiSelect} editMode={this.props.editMode} >
        {x}
       </DataTablesWrapper>
		);
 	}
 });

module.exports = DataTablesGrid;
