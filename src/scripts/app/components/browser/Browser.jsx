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
              itemOptionsDropdownCreator={this.createItemOptionsDropdown}
              />
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
                onSpaceSelect={this.handleSpaceSelect} />
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
            {item != null &&
              <ComponentDetailsPanel
                ref="details"
                item={item}
                type={this.state.items.type}
                loadSpec={this.loadSpec}
                loadSpecXml={this.loadXml}
                loadComments={this.loadComments}
                collapsed={this.state.detailsCollapsed}
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

  handleDownloadXml: function(item, evt) {
    evt.stopPropagation();
    window.location = ComponentRegistryClient.getRegistryUrl(this.state.items.type, item.id) + "/xml";
  },

  handleDownloadXsd: function(item, evt) {
    evt.stopPropagation();
    window.location = ComponentRegistryClient.getRegistryUrl(this.state.items.type, item.id) + "/xsd";
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
