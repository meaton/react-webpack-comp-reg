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
var ItemOptionsDropdown = require('./ItemOptionsDropdown');
var SpaceSelector = require("../datagrid/SpaceSelector.jsx");
var DataGridFilter = require("../datagrid/DataGridFilter.jsx");
var ComponentDetailsPanel = require('./ComponentDetailsPanel');
var BrowserMenuGroup = require('./BrowserMenuGroup');
var ComponentInfo = require('./ComponentInfo');
var RssLink = require('./RssLink');
var PanelExpandCollapseButton = require('../PanelExpandCollapseButton');

var ReactAlert = require('../../util/ReactAlert');

var ComponentRegistryClient = require('../../service/ComponentRegistryClient');

var classNames = require('classnames');

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

  getInitialState: function() {
    return {
      detailsCollapsed: false,
      detailsMaximised: false
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

  componentDidUpdate: function(prevProps, prevState) {
    if(this.state.items.statusFilter != prevState.items.statusFilter) {
      this.loadItems();
    }
  },

  render: function() {
    var item = this.state.selection.currentItem;
    var classes = classNames({
      "detailsCollapsed": this.state.detailsCollapsed,
      "detailsMaximised": this.state.detailsMaximised
    });
    return (
        <section id="browser" className={classes}>
          <div className="browser row">
            <DataGrid
              items={this.state.items.items}
              deletedItems={this.state.items.deleted}
              selectedItems={this.state.selection.selectedItems}
              loading={this.state.items.loading}
              editMode={false}
              onRowSelect={this.handleRowSelect}
              sortState={this.state.items.sortState}
              onToggleSort={this.toggleSort}
              multiSelect={this.state.selection.allowMultiple}
              itemOptionsDropdownCreator={this.createItemOptionsDropdown}>
              {!this.state.items.loading  /* show a message in the table if all results are excluded by filter */
                && this.state.items.filteredSize == 0
                && this.state.items.unfilteredSize != 0 && (
                  <tr><td className="hiddenByFilterMessage">
                    {this.state.items.unfilteredSize} item(s) hidden by filter
                    (<a onClick={this.clearFilter}>clear</a>).
                  </td></tr>
              )}
            </DataGrid>
            <div className="gridControls">
              <RssLink link={this.getRssLink()}/>
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
                validUserSession={this.state.auth.authState.uid != null}
                onSpaceSelect={this.handleSpaceSelect}
                statusFilter={this.state.items.statusFilter}
                onStatusFilterToggle={this.handleStatusFilterToggle}
                onStatusFilterReset={this.handleStatusFilterReset}
                />
              <BrowserMenuGroup
                  type={this.state.items.type}
                  space={this.state.items.space}
                  items={this.state.selection.selectedItems}
                  teams={this.state.team.teams}
                  selectedTeam={this.state.items.team}
                  loggedIn={this.state.auth.authState.uid != null}
                  moveToTeamEnabled={this.state.items.space != Constants.SPACE_PUBLISHED}
                  moveToTeam={this.handleMoveToTeam}
                  deleteComp={this.handleDelete}
                  onPublish={this.handlePublish}
                  onStatusChange={this.handleStatusChange}
                />
            </div>
          </div>
          <div className="viewer row">
            <PanelExpandCollapseButton
              title="Expand/collapse component details"
              expanded={!this.state.detailsCollapsed}
              onClick={this.toggleDetailsExpansion} />
            <PanelExpandCollapseButton
              title="Toggle maximisation of component details"
              expanded={this.state.detailsMaximised}
              onClick={this.toggleMaximiseExpansion}
              expandGlyph="fullscreen"
              collapseGlyph="resize-small"
              />
            {item != null ? (
              <ComponentDetailsPanel
                ref="details"
                item={item}
                type={this.state.items.type}
                loadSpec={this.loadSpec}
                loadSpecXml={this.loadXml}
                loadComments={this.loadComments}
                collapsed={this.state.detailsCollapsed}
                />
            ) : !this.state.items.loading && (
                <div className="noSelectionMessage">
                  <p>Select a component or profile in the table to see its details</p>
                </div>
            )
            }
          </div>
        </section>
    );
  },

  loadItems: function() {
    this.getFlux().actions.loadItems(this.state.items.type, this.state.items.space, this.state.items.team, this.state.items.statusFilter);
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

  handleSpaceSelect: function(type, registry, group) {
    this.getFlux().actions.switchSpace(type, registry, group);
    this.getFlux().actions.loadItems(type, registry, group);
  },

  handleRowSelect: function(item, multiSelect) {
    this.getFlux().actions.selectBrowserItem(item, multiSelect);

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

  handlePublish: function(status) {
    var selection = this.state.selection.selectedItems;
    var onSuccess = function() {
      ReactAlert.showMessage('Item(s) published',
      <div><p>The following items have been published with {status} status:</p>
      <ul>
        {
          Object.keys(selection).map(function(id){
            return (<li key={id}>{selection[id].name}</li>);
          })
        }
      </ul>
      </div>
      );
    };
    this.getFlux().actions.publishItems(this.state.items.type, selection, status, onSuccess);
  },

  handleMoveToTeam: function(teamId) {
    var ids = Object.keys(this.state.selection.selectedItems);
    log.debug("Move to team", ids, teamId);
    this.getFlux().actions.moveComponentsToTeam(ids, teamId);
  },

  handleStatusChange: function(status) {
    var ids = Object.keys(this.state.selection.selectedItems);
    if(ids.length == 1) {
      var item = this.state.selection.selectedItems[ids[0]];

      if(this.state.items.space === Constants.SPACE_PRIVATE || this.state.items.space === Constants.SPACE_TEAM) { /* skip check for private or team space */
        //TODO: || this.state.auth.authState.isAdmin /* skip check for admin */
        this.handleAllowedStatusChange(status);
      } else {
        //For status change in public space, we need to check whether the permissions are ok
        this.getFlux().actions.checkStatusUpdateRights(item, this.state.auth.authState,
          this.handleAllowedStatusChange.bind(this, status),
          this.handleDisallowedStatusChange.bind(this, status));
      }
    }
  },

  handleAllowedStatusChange: function(status) {
    var ids = Object.keys(this.state.selection.selectedItems);
    if(ids.length == 1) {
      var item = this.state.selection.selectedItems[ids[0]];
      var type = this.state.items.type;
      var statusName = getStatusName(status);

      ReactAlert.showConfirmationDialogue("Change item status to " + statusName + "?",
        <p>Are you sure that you want to change the status of '{item.name}' to <strong>{statusName}</strong>?
        The status of a component or profile influences its visibility to other users.
        Once the status has been changed, you cannot change it back. Press <em>Yes</em> to apply the status change, or <em>No</em> to abort.</p>,
        this.performStatusChange.bind(this, status, item, type));
    }
  },

  performStatusChange: function(status, item, type) {
    this.getFlux().actions.updateComponentStatus(item, type, status, function() {
      this.loadItems();
      var statusName = getStatusName(status);
      ReactAlert.showMessage("Item status changed to " + statusName,
        <div>
          <p>The status of '{item.name}' has been changed to <strong>{statusName}</strong>.</p>
          <p>As a result, it may not be visible anymore depending on which status filters have been applied.
          Use the status filter selectors to hide or show components or profiles with a specific status.</p>
        </div>
      );
    }.bind(this));
  },

  handleDisallowedStatusChange: function(status, errorMessage) {
    var item;
    var ids = Object.keys(this.state.selection.selectedItems);
    if(ids.length == 1) {
      item = this.state.selection.selectedItems[ids[0]];
    } else {
      item = {name: "UNKNOWN", id: "-1"};
    }

    var type = this.state.items.type;
    var statusName = getStatusName(status);
    ReactAlert.showMessage('Cannot change item status to ' + statusName,
      <div>
        <p>The status of '{item.name}' <strong>cannot</strong> be changed to {statusName} because you are not its owner or belong to the team that owns it.</p>
        <p>You can request a status change of '{item.name}' by sending a <a href={
            "mailto:cmdi@clarin.eu?subject=" + "[Component Registry] Request: change status of " + type + " '" + item.name + "' (" + item.id + ") to " + statusName
          }>message to cmdi@clarin.eu</a>.</p>
        {errorMessage &&
          <p>Additional information: {errorMessage}</p>
        }
      </div>
    );
  },

  handleStatusFilterToggle: function(status) {
    this.getFlux().actions.toggleStatusFilter(status);
  },

  handleStatusFilterReset: function(status) {
    this.getFlux().actions.resetStatusFilter();
  },

  handleFilterTextChange: function(evt) {
    this.getFlux().actions.setFilterText(evt.target.value);
  },

  clearFilter: function(evt) {
    this.getFlux().actions.setFilterText(null);
  },

  toggleSort: function(column) {
    this.getFlux().actions.toggleSortState(column);
  },

  handleDownloadXml: function(item, version, evt) {
    evt.stopPropagation();
    window.location = ComponentRegistryClient.getRegistryUrl(this.state.items.type, item.id, version) + "/xml";
  },

  handleDownloadXsd: function(item, version, evt) {
    evt.stopPropagation();
    window.location = ComponentRegistryClient.getRegistryUrl(this.state.items.type, item.id, version) + "/xsd";
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
  },

  toggleDetailsExpansion: function() {
    this.setState({
      detailsCollapsed: !this.state.detailsCollapsed,
      detailsMaximised: false
    });
  },

  toggleMaximiseExpansion: function() {
    this.setState({
      detailsMaximised: !this.state.detailsMaximised,
      detailsCollapsed: false
    });
  },

  createItemOptionsDropdown: function(item) {
    return (
      <ItemOptionsDropdown
        item={item}
        onClickInfo={this.showComponentInfo}
        onClickDownloadXml={this.handleDownloadXml}
        onClickDownloadXsd={this.state.items.type === Constants.TYPE_PROFILE ? this.handleDownloadXsd : null} />
    );
  },

  getRssLink: function() {
    // make an rss link for the current space/type selection state
    var rssLink = ComponentRegistryClient.getRegistryUrl(this.state.items.type) + "/rss"
      + "?registrySpace=" + ComponentRegistryClient.getRegistrySpacePath(this.state.items.space);
    if(this.state.items.space === Constants.SPACE_TEAM) {
      rssLink += "&groupId=" + this.state.items.team;
    }
    return rssLink;
  }
});

module.exports = Browser;

function getStatusName(status) {
  if(status === Constants.STATUS_DEPRECATED)
    return "deprecated";
  else if(status === Constants.STATUS_PRODUCTION)
    return "production";
  else if(status === Constants.STATUS_DEVELOPMENT)
    return "development";
  else
    return status + "(??)";
}
