var log = require("loglevel");

var React = require("react"),
    Constants = require("../../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

// Components
var DataGrid = require("../DataGrid.jsx");
var SpaceSelector = require("../SpaceSelector.jsx");
var ComponentDetails = require('./ComponentDetailsOverview');
var BrowserMenuGroup = require('./BrowserMenuGroup');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

require('../../../../styles/Browser.sass');

var Browser = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ItemsStore", "SelectionStore", "ComponentDetailsStore", "AuthenticationStore", "GroupStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("ItemsStore").getState(),
      selection: flux.store("SelectionStore").getState(),
      details: flux.store("ComponentDetailsStore").getState(),
      auth: flux.store("AuthenticationStore").getState(),
      group: flux.store("GroupStore").getState()
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
          />
    return (
        <section id="browser">
          <div className="browser row">
            <div className="gridFilter">
              <Input type="search" value={this.state.items.filterText} onChange={this.handleFilterTextChange} />
            </div>
            <SpaceSelector
              type={this.state.items.type}
              space={this.state.items.space}
              groups={this.state.group.groups}
              selectedGroup={this.state.items.group}
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
              items={this.state.items.items}
              deletedItems={this.state.items.deleted}
              selectedItems={this.state.selection.selectedItems}
              loading={this.state.items.loading}
              multiSelect={this.state.selection.allowMultiple}
              editMode={false}
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

  handleSpaceSelect: function(type, registry, group) {
    this.getFlux().actions.switchSpace(type, registry, group);
    this.getFlux().actions.loadItems(type, registry);
  },

  handleRowSelect: function(item, target) {
    this.getFlux().actions.selectBrowserItem(item);
  },

  handleDelete: function(componentInUsageCb) {
    var ids = Object.keys(this.state.selection.selectedItems);
    this.getFlux().actions.deleteComponents(this.state.items.type, ids, componentInUsageCb);
  },

  handleFilterTextChange: function(evt) {
    this.getFlux().actions.setFilterText(evt.target.value);
  }
});

module.exports = Browser;
