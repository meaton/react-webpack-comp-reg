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
    selectedItems: React.PropTypes.array.isRequired,
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
          multiple={multiSelect}
          buttonBefore={addButton}
          onClick={self.rowClick}
          selected={selectedContext[d.id]}
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
    // var self = this;
    // var tableId = this.refs.wrapper.getDOMNode().id;
    // var currentItem = this.state.lastSelectedItem;
    //
    // if(currentItem != null && currentItem != target && !this.state.multiSelect)
    //   currentItem.setState({selected: false, active: false});
    //
    // console.log('addComponent:' + addComponent);
    //
    // this.setState(function(state, props) {
    //   if(currentItem != target && !(currentItem == null && val === this.context.itemId) && target.state.selected) {
    //     self.loadItem(state.currentType.substr(0, state.currentType.length-1), val);
    //   } else if(addComponent && state.currentType == "components") {
    //     console.log('add component: ' + target.refs.addButton.props.active);
    //
    //     self.props.component(val, target.refs.addButton.props.active);
    //     target.setState({ active: false });
    //   } else {
    //     var selectedRows = $('#' + tableId + ' tr.selected:first');
    //
    //     if(selectedRows.length < 1)
    //       self.props.profile(null); //TODO find next selection item in multiple select mode
    //     else {
    //       var id = selectedRows.data().reactid;
    //       if(id != undefined && id.indexOf('clarin') > 0) {
    //         id = id.substr(id.indexOf('$')+1, id.length).replace(/=1/g, '.').replace(/=2/g, ':');
    //         self.loadItem(state.currentType.substr(0, state.currentType.length-1), id);
    //       }
    //     }
    //     return { lastSelectedItem: null };
    //   }
    //
    //   return  { lastSelectedItem: target };
    // });
  },

  showProfile: function() {
    //todo: trigger action
  },

  showComponent: function() {
    //todo: trigger action
  }
});

module.exports = DataGrid;
