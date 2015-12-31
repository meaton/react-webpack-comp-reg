var log = require('loglevel');

//react
var React = require("react"),
    Constants = require("../../constants");

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//components
var DataTablesWrapper = require("./DataTablesWrapper.jsx"),
    DataTablesRow = require("./DataTablesRow.jsx")

//utils
var classNames = require("classnames");

require('../../../../styles/DataGrid.sass');

var DataGrid = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    items: React.PropTypes.array.isRequired,
    selectedItems: React.PropTypes.object,
    loading: React.PropTypes.bool.isRequired,
    editMode: React.PropTypes.bool.isRequired,
    deletedItems: React.PropTypes.object,
    onRowSelect: React.PropTypes.func,
    rowSelectAllowed: React.PropTypes.bool,
    onClickInfo: React.PropTypes.func,
    onClickDownloadXml: React.PropTypes.func,
    onClickDownloadXsd: React.PropTypes.func,
    onToggleSort: React.PropTypes.func,
    sortState: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      selectedItems: {},
      rowSelectAllowed: true,
      editMode: false
    };
  },

  render: function() {
    var self = this;
    var selectedContext = this.props.selectedItems;
    var addButton = (this.props.editMode) ? true : false;
    var multiSelect = this.props.multiSelect;

    var x = this.props.items.map(function(d, index){
     var className = (index+1) % 2 ? "odd" : "even";

     // deal with deletion
     var deletedItems = self.props.deletedItems;
     if(deletedItems != undefined) {
       if(deletedItems.hasOwnProperty(d.id)) {
         var deleteState = deletedItems[d.id];
         if(deleteState === Constants.DELETE_STATE_DELETED) {
           // don't show anything for the deleted item
           return null;
         }
         if(deleteState === Constants.DELETE_STATE_DELETING) {
           className += " deleting";
         }
       }
     }

     return (
        <DataTablesRow
          data={d}
          key={d.id}
          buttonBefore={addButton}
          onClick={self.rowClick}
          selected={selectedContext[d.id]?true:false}
          className={className}
          rowSelectAllowed={self.props.rowSelectAllowed}
          onClickInfo={self.props.onClickInfo}
          onClickDownloadXml={self.props.onClickDownloadXml}
          onClickDownloadXsd={self.props.onClickDownloadXsd}
          >
        </DataTablesRow>
     );
    });

    return (
      <div className={classNames("grid", {"loading": this.props.loading})} id="grid">
        {this.props.loading && <div className="loader spinner-loader">Loading...</div>}
        <DataTablesWrapper
          ref="wrapper"
          editMode={this.props.editMode}
          sortState={this.props.sortState}
          onToggleSort={this.props.onToggleSort}
          onClickInfo={this.props.onClickInfo}
          onClickDownloadXml={this.props.onClickDownloadXml}
          onClickDownloadXsd={this.props.onClickDownloadXsd}
          multiSelect={this.props.multiSelect}>
         {x}
        </DataTablesWrapper>
      </div>
   );
  },

  rowClick: function(val, evt) {
    var requestMultiSelect = evt.metaKey || evt.ctrlKey;
    if(requestMultiSelect
      || this.props.multiSelect
      || !this.props.selectedItems[val.id]) { // otherwise no update needed, item already selected
      this.props.onRowSelect(val, requestMultiSelect);
    }
  }
});

module.exports = DataGrid;
