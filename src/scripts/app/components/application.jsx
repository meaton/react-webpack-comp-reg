var React = require("react"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var DataGrid = require("./DataGrid.jsx")

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ItemsStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("ItemsStore").getState()
    };
  },

  render: function() {
    return (
      <section className="application-container">
        <DataGrid items={this.state.items.items} onReload={this.onReload} />
      </section>
    );
  },

  onReload: function() {
    this.getFlux().actions.loadItems();
  }
});

module.exports = Application;
