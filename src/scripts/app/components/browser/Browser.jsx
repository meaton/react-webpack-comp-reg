var log = require("loglevel");

var React = require("react"),
    Constants = require("../../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Config = require('../../../config');

// Bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

// Components
var DataGrid = require("../datagrid/DataGrid.jsx");
var SpaceSelector = require("../datagrid/SpaceSelector.jsx");
var DataGridFilter = require("../datagrid/DataGridFilter.jsx");
var ComponentDetails = require('./ComponentDetailsOverview');
var BrowserMenuGroup = require('./BrowserMenuGroup');

var ComponentRegistryClient = require('../../service/ComponentRegistryClient');

var ReactAlert = require('../../util/ReactAlert');

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
      // user logged in or out, update teams
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
            <DataGridFilter
              value={this.state.items.filterText}
              onChange={this.handleFilterTextChange} />
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
            <DataGrid
              items={this.state.items.items}
              deletedItems={this.state.items.deleted}
              selectedItems={this.state.selection.selectedItems}
              loading={this.state.items.loading}
              multiSelect={this.state.selection.allowMultiple}
              editMode={false}
              onRowSelect={this.handleRowSelect}
              onClickInfo={this.showInfo}
              />
          </div>
          <div className="viewer row">
            {viewer}
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

  handleMoveToTeam: function(teamId) {
    var ids = Object.keys(this.state.selection.selectedItems);
    log.debug("Move to team", ids, teamId);
    this.getFlux().actions.moveComponentsToTeam(ids, teamId);
  },

  handleFilterTextChange: function(evt) {
    this.getFlux().actions.setFilterText(evt.target.value);
  },

  showInfo: function(item) {
    var bookmarkLink = Config.webappUrl + "/?itemId=" + item.id + "&registrySpace=" + ComponentRegistryClient.getRegistrySpacePath(this.state.items.space);
    var xsdLink = ComponentRegistryClient.getRegistryUrl(this.state.items.type, item.id) + "/xsd";

    ReactAlert.showAlert(function(closeAlert) { return (
      <Modal title={"Info for " + item.name}
        enforceFocus={true}
        backdrop={true}
        animation={false}
        container={this}
        onRequestHide={closeAlert}>
        <div className="modal-body">
          <div className="modal-desc component-info">
            <div>Bookmark link: <a href={bookmarkLink}>{bookmarkLink}</a></div>
            <div>Link to xsd: <a href={xsdLink}>{xsdLink}</a></div>
          </div>
        </div>
      </Modal>
    )}.bind(this));
  }
});

module.exports = Browser;
