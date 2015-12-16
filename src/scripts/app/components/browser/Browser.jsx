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
var Clipboard = require('clipboard');

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
            </div>
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

  toggleSort: function(column) {
    this.getFlux().actions.toggleSortState(column);
  },

  showComponentInfo: function(item) {
    var contentId = "componentInfoModal";

    var clipboard; //initialise after dialogue shown (the DOM elements need to exist)
    ReactAlert.showModalAlert(
      "Info for " + item.name,
      this.renderComponentInfoBody.bind(null, item, contentId),
      null, //no footer
      function() {
        if(clipboard) {
          //as advised...
          clipboard.destroy();
        }
      }
    );
    clipboard = new Clipboard("#" + contentId + " .btn");
  },

  renderComponentInfoBody: function(item, contentId) {
    var bookmarkLink = Config.webappUrl + "/?itemId=" + item.id + "&registrySpace=" + ComponentRegistryClient.getRegistrySpacePath(this.state.items.space);
    if(this.state.items.space === Constants.SPACE_TEAM) {
      bookmarkLink += "&groupId=" + this.state.items.team;
    }
    var xsdLink = this.state.items.type === Constants.TYPE_PROFILE ? ComponentRegistryClient.getRegistryUrl(this.state.items.type, item.id) + "/xsd" : null;

    //not setting onChange to the inputs will generate a warning unless readOnly
    //is set, which does not yield the desired behaviour, therefore a noop function is passed
    var noop = function() {};

    return (
      <div id={contentId} className="modal-desc component-info">
        <div>
          <a href={bookmarkLink}>Bookmark link:</a>
          <div>
            <input id="bookmarkLink" type="text" value={bookmarkLink} onChange={noop} />
            <button type="button" className="btn btn-default" data-clipboard-target="#bookmarkLink" title="Copy to clipboard">
              <span className="glyphicon glyphicon-copy" aria-hidden="true"/>
            </button>
          </div>
        </div>
        {xsdLink != null && (
          <div>
            <a href={xsdLink}>Link to xsd:</a>
            <div>
              <input id="xsdLink" type="text" value={xsdLink} onChange={noop} />
              <button type="button" className="btn btn-default" data-clipboard-target="#xsdLink" title="Copy to clipboard">
                <span className="glyphicon glyphicon-copy" aria-hidden="true"/>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
});

module.exports = Browser;
