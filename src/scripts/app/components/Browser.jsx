var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

// Components
var DataGrid = require("./DataGrid.jsx");
var SpaceSelector = require("./SpaceSelector.jsx");
var ComponentDetails = require('./ComponentDetailsOverview');
var BrowserMenuGroup = require('./BrowserMenuGroup');

require('../../../styles/Browser.sass');

var Browser = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ItemsStore", "SelectionStore", "ComponentDetailsStore", "AuthenticationStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("ItemsStore").getState(),
      selection: flux.store("SelectionStore").getState(),
      details: flux.store("ComponentDetailsStore").getState(),
      auth: flux.store("AuthenticationStore").getState()
    };
  },

  render: function() {
    var item = this.state.selection.currentItem;
    var viewer =
     (!item)? null :
        <ComponentDetails
          ref="details"
          item={item}
          type={this.state.items.type}
          space={this.state.items.space}
          />
    return (
        <section id="browser">
          <div className="browser row">
            <SpaceSelector
              type={this.state.items.type}
              space={this.state.items.space}
              multiSelect={this.state.selection.allowMultiple}
              validUserSession={this.state.auth.authState.uid != null}
              onSpaceSelect={this.handleSpaceSelect}
              onToggleMultipleSelect={this.handleToggleMultipleSelect} />
            <BrowserMenuGroup
                type={this.state.items.type}
                space={this.state.items.space}
                items={this.state.selection.selectedItems}
                loggedIn={this.state.auth.authState.uid != null}
                multiSelect={this.state.selection.allowMultiple}
                deleteComp={this.handleDelete}
              />
            <DataGrid
              ref="dataGrid"
              items={this.state.items.items}
              deletedItems={this.state.items.deleted}
              selectedItems={this.state.selection.selectedItems}
              loading={this.state.items.loading}
              multiSelect={this.state.selection.allowMultiple}
              editMode={false}
              onReload={this.loadItems}
              onRowSelect={this.handleRowSelect}
              />
          </div>
          <div className="viewer row">
            {viewer}
          </div>
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

  handleSpaceSelect: function(type, registry) {
    this.getFlux().actions.switchSpace(type, registry);
    this.getFlux().actions.loadItems(type, registry);
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
  },
  handleDelete: function() {
    var ids = Object.keys(this.state.selection.selectedItems);
    this.getFlux().actions.deleteComponents(this.state.items.type, this.state.items.space, ids);
  }
});

module.exports = Browser;
