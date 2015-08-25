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
    loading: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    editMode: React.PropTypes.bool.isRequired,
    onReload: React.PropTypes.func.isRequired,
    errorMessage: React.PropTypes.string
  },

  render: function() {
    var self = this;
    var contextItemId = this.context.itemId;
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
          selected={contextItemId != undefined && contextItemId === d.id}
          className={(index+1 % 2) ? "odd" : "even"} >
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
//
//     return (
//       <div>
//         <div className={"grid" + (this.props.loading?" wait":"")} id="grid">
//           {this.props.loading ? <span>Loading...</span> : null}
//           {(this.props.errorMessage != null) ? <span className="error">{this.props.errorMessage}</span> : null}
//
//           // <DataTablesGrid ref="grid"
//           //   type={this.props.type}
//           //   filter={this.props.space}
//           //   multiple={this.props.multiSelect}
//           //   children={this.props.items}
//           //   profile={this.showProfile}
//           //   component={this.showComponent}
//           //   />
// {
//           // <ul>
//           //   {
//           //     this.props.items.map(function(item, i){
//           //       return(
//           //         <li key={item.id}>
//           //           <span>{item.name}</span>
//           //         </li>
//           //       );
//           //     })}
//           // </ul>
// }
//         </div>
//         <a onClick={this.props.onReload}>reload</a>
//       </div>
//     )
  },

  showProfile: function() {
    //todo: trigger action
  },

  showComponent: function() {
    //todo: trigger action
  }
});

module.exports = DataGrid;
