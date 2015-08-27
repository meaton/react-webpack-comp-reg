var React = require("react"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var DataGrid = require("./DataGrid.jsx"),
    SpaceSelector = require("./SpaceSelector.jsx")

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("BrowserItemsStore", "BrowserSelectionStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("BrowserItemsStore").getState(),
      selection: flux.store("BrowserSelectionStore").getState()
    };
  },

  render: function() {
    //TODO: get login state from UserStore/AuthStore -> validUserSession
    return (
      <section className="application-container">
        <SpaceSelector
          type={this.state.items.type}
          space={this.state.items.space}
          multiSelect={this.state.selection.allowMultiple}
          validUserSession={false}
          onSpaceSelect={this.handleSpaceSelect}
          onToggleMultipleSelect={this.handleToggleMultipleSelect}
          onChange={this.clearInfo} />
        <DataGrid
          items={this.state.items.items}
          loading={this.state.items.loading}
          errorMessage={this.state.items.errorMessage}
          multiSelect={false}
          editMode={false}
          onReload={this.loadItems} />
      </section>
    );
  },

  componentDidMount: function() {
    this.loadItems();
  },

  loadItems: function() {
    this.getFlux().actions.loadItems(this.state.items.type, this.state.items.space);
  },

  handleToggleMultipleSelect: function() {
    this.getFlux().actions.switchMultipleSelect();
  },

  handleSpaceSelect: function(space) {
    //TODO
  }
});

module.exports = Application;
