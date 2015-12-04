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
  mixins: [FluxMixin, StoreWatchMixin("ItemsStore", "SelectionStore", "ComponentDetailsStore", "AuthenticationStore", "TeamStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("ItemsStore").getState(),
      selection: flux.store("SelectionStore").getState(),
      details: flux.store("ComponentDetailsStore").getState(),
      auth: flux.store("AuthenticationStore").getState(),
      team: flux.store("TeamStore").getState()
    };
  },

  componentDidMount: function() {
    this.loadItems();
    this.loadTeams();
  },

  componentWillUpdate: function(nextProps, nextState) {
    if(this.state.auth.authState != nextState.auth.authState) {
      // user logged in or out, update groups
      this.loadTeams();
    }
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
              groups={this.state.team.teams}
              selectedGroup={this.state.items.group}
              multiSelect={this.state.selection.allowMultiple}
              validUserSession={this.state.auth.authState.uid != null}
              onSpaceSelect={this.handleSpaceSelect}
              onToggleMultipleSelect={this.handleToggleMultipleSelect} />
            <BrowserMenuGroup
                type={this.state.items.type}
                space={this.state.items.space}
                items={this.state.selection.selectedItems}
                groups={this.state.team.teams}
                selectedGroup={this.state.items.group}
                loggedIn={this.state.auth.authState.uid != null}
                multiSelect={this.state.selection.allowMultiple}
                moveToGroupEnabled={this.state.items.space != Constants.SPACE_PUBLISHED}
                moveToGroup={this.handleMoveToGroup}
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

  loadItems: function() {
    this.getFlux().actions.loadItems(this.state.items.type, this.state.items.space, this.state.items.group);
  },

  loadTeams: function() {
    this.getFlux().actions.loadTeams();
  },

  handleToggleMultipleSelect: function() {
    this.getFlux().actions.switchMultipleSelect();
  },

  handleSpaceSelect: function(type, registry, group) {
    this.getFlux().actions.switchSpace(type, registry, group);
    this.getFlux().actions.loadItems(type, registry, group);
  },

  handleRowSelect: function(item, target) {
    this.getFlux().actions.selectBrowserItem(item);
  },

  handleDelete: function(componentInUsageCb) {
    var ids = Object.keys(this.state.selection.selectedItems);
    this.getFlux().actions.deleteComponents(this.state.items.type, ids, componentInUsageCb);
  },

  handleMoveToGroup: function(groupId) {
    var ids = Object.keys(this.state.selection.selectedItems);
    log.debug("Move to group", ids, groupId);
    this.getFlux().actions.moveComponentsToGroup(ids, groupId);
  },

  handleFilterTextChange: function(evt) {
    this.getFlux().actions.setFilterText(evt.target.value);
  }
});

module.exports = Browser;
