var React = require("react")
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    DataTablesWrapper = require("./DataTablesWrapper.jsx"),
    DataTablesRow = require("./DataTablesRow.jsx")

require('../../../styles/DataGrid.sass');

var DataGrid = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    items: React.PropTypes.array.isRequired,
    selectedItems: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    editMode: React.PropTypes.bool.isRequired,
    onReload: React.PropTypes.func.isRequired,
    errorMessage: React.PropTypes.string,
    onRowSelect: React.PropTypes.func
  },

  render: function() {
    var self = this;
    var selectedContext = this.props.selectedItems;
    var addButton = (this.props.editMode) ? true : false;
    var multiSelect = this.props.multiSelect;

    var x = this.props.items.map(function(d, index){
     return (
        <DataTablesRow
          data={d}
          key={d.id}
          multiple={self.props.multiSelect}
          buttonBefore={addButton}
          onClick={self.rowClick}
          selected={selectedContext[d.id]?true:false}
          className={(index+1) % 2 ? "odd" : "even"} >
        </DataTablesRow>
     );
    });

    return (
      <div>

        <div className={"grid" + (this.props.loading?" wait":"")} id="grid">
          {this.props.loading ? <span>Loading...</span> : null}
          {(this.props.errorMessage != null) ? <span className="error">{this.props.errorMessage}</span> : null}
          <DataTablesWrapper ref="wrapper" multiple={this.props.multiSelect} editMode={this.props.editMode} >
           {x}
          </DataTablesWrapper>
        </div>

        <a onClick={this.props.onReload}>reload</a>
      </div>
   );
  },

  rowClick: function(val, target, addComponent) {
    this.props.onRowSelect(val, target);
  }
});

module.exports = DataGrid;
