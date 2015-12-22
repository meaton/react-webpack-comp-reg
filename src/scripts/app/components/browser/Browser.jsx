'use strict';
var log = require("loglevel");

var React = require("react"),
    Constants = require("../../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var History = require('react-router').History;

// Bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

// Components
var DataGrid = require("../datagrid/DataGrid.jsx");
var SpaceSelector = require("../datagrid/SpaceSelector.jsx");
var DataGridFilter = require("../datagrid/DataGridFilter.jsx");
var ComponentDetails = require('./ComponentDetailsOverview');
var BrowserMenuGroup = require('./BrowserMenuGroup');
var ComponentInfo = require('./ComponentInfo');
var RssLink = require('./RssLink');

var ReactAlert = require('../../util/ReactAlert');

var ComponentRegistryClient = require('../../service/ComponentRegistryClient');

require('../../../../styles/Browser.sass');

var Browser = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ItemsStore", "SelectionStore", "ComponentDetailsStore", "AuthenticationStore", "TeamStore"), History],

  contextTypes: {
    history: React.PropTypes.object
  },

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
      // user logged in or out, update teams
      this.loadTeams();
    }
  },

  render: function() {
    var item = this.state.selection.currentItem;
    var rssLink = ComponentRegistryClient.getRegistryUrl(this.state.items.type) + "/rss";
    //TODO: private/team space this.state.items.space this.state.items.team

    return (
        <section id="browser">
          <div className="browser row">
            <DataGrid
              items={this.state.items.items}
              deletedItems={this.state.items.deleted}
              selectedItems={this.state.selection.selectedItems}
              loading={this.state.items.loading}
              multiSelect={this.state.selection.allowMultiple}
              editMode={false}
              onRowSelect={this.handleRowSelect}
              onClickInfo={this.showComponentInfo}
              sortState={this.state.items.sortState}
              onToggleSort={this.toggleSort}
              />
            <div className="gridControls">
              <RssLink link={rssLink}/>
              <DataGridFilter
                value={this.state.items.filterText}
                onChange={this.handleFilterTextChange}
                numberShown={this.state.items.filteredSize}
                numberTotal={this.state.items.unfilteredSize}
                 />
              <SpaceSelector
                type={this.state.items.type}
                space={this.state.items.space}
                teams={this.state.team.teams}
                selectedTeam={this.state.items.team}
                multiSelect={this.state.selection.allowMultiple}
                validUserSession={this.state.auth.authState.uid != null}
                onSpaceSelect={this.handleSpaceSelect}
                onToggleMultipleSelect={this.handleToggleMultipleSelect} />
              <BrowserMenuGroup
                  type={this.state.items.type}
                  space={this.state.items.space}
                  items={this.state.selection.selectedItems}
                  teams={this.state.team.teams}
                  selectedTeam={this.state.items.team}
                  loggedIn={this.state.auth.authState.uid != null}
                  multiSelect={this.state.selection.allowMultiple}
                  moveToTeamEnabled={this.state.items.space != Constants.SPACE_PUBLISHED}
                  moveToTeam={this.handleMoveToTeam}
                  deleteComp={this.handleDelete}
                />
            </div>
          </div>
          <div className="viewer row">
            {item != null &&
              <ComponentDetails
                ref="details"
                item={item}
                type={this.state.items.type}
                loadSpec={this.loadSpec}
                loadSpecXml={this.loadXml}
                loadComments={this.loadComments}
                />
            }
          </div>
        </section>
    );
  },

  loadItems: function() {
    this.getFlux().actions.loadItems(this.state.items.type, this.state.items.space, this.state.items.team);
  },

  loadTeams: function() {
    this.getFlux().actions.loadTeams();
  },

  loadSpec: function (itemId) {
    this.getFlux().actions.loadComponentSpec(this.state.items.type, itemId);
  },

  loadXml: function (itemId) {
    this.getFlux().actions.loadComponentSpecXml(this.state.items.type, itemId);
  },

  loadComments: function(itemId) {
    this.getFlux().actions.loadComments(this.state.items.type, itemId);
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

    log.debug("Item", item);

    var index = this.state.details.activeView;
    if(index === Constants.INFO_VIEW_SPEC) {
      this.loadSpec(item.id);
    }
    if(index === Constants.INFO_VIEW_XML) {
      this.loadXml(item.id);
    }
    if(index == Constants.INFO_VIEW_COMMENTS) {
      this.loadComments(item.id);
    }
  },

  handleDelete: function(componentInUsageCb) {
    var ids = Object.keys(this.state.selection.selectedItems);
    this.getFlux().actions.deleteComponents(this.state.items.type, ids, componentInUsageCb);
  },

  handleMoveToTeam: function(teamId) {
    var ids = Object.keys(this.state.selection.selectedItems);
    log.debug("Move to team", ids, teamId);
    this.getFlux().actions.moveComponentsToTeam(ids, teamId);
  },

  handleFilterTextChange: function(evt) {
    this.getFlux().actions.setFilterText(evt.target.value);
  },

  toggleSort: function(column) {
    this.getFlux().actions.toggleSortState(column);
  },

  showComponentInfo: function(item) {
    ReactAlert.showModalAlert(
      "Info for " + item.name,
      <ComponentInfo
          className="modal-desc component-info"
          item={item}
          type={this.state.items.type}
          space={this.state.items.space}
          team={this.state.items.team}
          history={this.history}
           />
    );
  }
});

module.exports = Browser;
