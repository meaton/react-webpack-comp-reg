var log = require('loglevel');

//react
var React = require("react"),
    Constants = require("../constants");

//components
var DataTablesWrapper = require("./DataTablesWrapper.jsx"),
    DataTablesRow = require("./DataTablesRow.jsx")

require('../../../styles/DataGrid.sass');

var DataGrid = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    selectedItems: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    editMode: React.PropTypes.bool.isRequired,
    deletedItems: React.PropTypes.object,
    onRowSelect: React.PropTypes.func
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
          multiple={self.props.multiSelect}
          buttonBefore={addButton}
          onClick={self.rowClick}
          selected={selectedContext[d.id]?true:false}
          className={className} >
        </DataTablesRow>
     );
    });

    return (
      <div className={"grid" + (this.props.loading?" wait":"")} id="grid">
        {this.props.loading ? <span>Loading...</span> : null}
        <DataTablesWrapper ref="wrapper" multiple={this.props.multiSelect} editMode={this.props.editMode} >
         {x}
        </DataTablesWrapper>
      </div>
   );
  },

  rowClick: function(val, target, addComponent) {
    this.props.onRowSelect(val, target);
  }
});

module.exports = DataGrid;
