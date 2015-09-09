var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var DataGrid = require("./DataGrid.jsx");
var SpaceSelector = require("./SpaceSelector.jsx");

var ComponentDetails = require('./ComponentDetailsOverview');
// var Component = require('./ComponentOverview');

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("BrowserItemsStore", "BrowserSelectionStore", "ComponentDetailsStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("BrowserItemsStore").getState(),
      selection: flux.store("BrowserSelectionStore").getState(),
      details: flux.store("ComponentDetailsStore").getState()
    };
  },

  render: function() {
    //TODO: get login state from UserStore/AuthStore -> validUserSession
    var item = this.state.selection.currentItem;
    var viewer =
     (!item)? null :
     //TODO flux: component overview - merge?
     //:<Component ref="component" componentId={item} />
       (this.state.items.type == Constants.TYPE_PROFILE) ?
        <ComponentDetails
          ref="profile"
          item={item}
          type={this.state.items.type}
          space={this.state.items.space}
          />
        :null

    return (
      <section className="application-container">
        <div className="main container-fluid">
          <div className="browser row">
            <SpaceSelector
              type={this.state.items.type}
              space={this.state.items.space}
              multiSelect={this.state.selection.allowMultiple}
              validUserSession={false}
              onSpaceSelect={this.handleSpaceSelect}
              onToggleMultipleSelect={this.handleToggleMultipleSelect}
              onChange={this.clearInfo} />
            {/*TODO: <DataTablesBtnGroup { ...this.getBtnGroupProps() } />*/}
            <DataGrid
              items={this.state.items.items}
              selectedItems={this.state.selection.selectedItems}
              loading={this.state.items.loading}
              errorMessage={this.state.items.errorMessage}
              multiSelect={this.state.selection.allowMultiple}
              editMode={false}
              onReload={this.loadItems}
              onRowSelect={this.handleRowSelect}
              />
          </div>
          <div className="viewer row">
            {viewer}
          </div>
          <div id="alert-container" /></div>
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
  },

  handleRowSelect: function(val, target) {
    this.getFlux().actions.selectBrowserItem(val);

    // update the info view
    if(this.state.details.activeView == Constants.INFO_VIEW_SPEC) {
      this.getFlux().actions.loadComponentSpec(this.state.items.type, this.state.items.space, val);
    }
    if(this.state.details.activeView == Constants.INFO_VIEW_XML) {
      this.getFlux().actions.loadComponentSpecXml(this.state.items.type, this.state.items.space, val);
    }
    //TODO flux: comments
  }
});

module.exports = Application;
