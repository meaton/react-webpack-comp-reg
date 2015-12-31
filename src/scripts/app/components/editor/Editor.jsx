'use strict';

var log = require('loglevel');

var React = require("react"),
    Constants = require("../../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var EditorForm = require("./EditorForm"),
    DataGrid = require("../datagrid/DataGrid.jsx"),
    SpaceSelector = require("../datagrid/SpaceSelector.jsx"),
    DataGridFilter = require("../datagrid/DataGridFilter.jsx");

var ComponentViewMixin = require('../../mixins/ComponentViewMixin');

var AuthUtil = require('../AuthState').AuthUtil;
var ReactAlert = require('../../util/ReactAlert');

require('../../../../styles/ComponentEditor.sass');

/**
* Editor - main editor component and route handler for editor subroutes
* Has two "parts": the editor form (encapsulated in a single child component
* 'EditorForm') and the data grid plus controls.
* @constructor
*/
var Editor = React.createClass({
  mixins: [FluxMixin, ComponentViewMixin,
            StoreWatchMixin("AuthenticationStore","ComponentDetailsStore", "EditorStore", "TeamStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      auth: flux.store("AuthenticationStore").getState(),
      details: flux.store("ComponentDetailsStore").getState(),
      editor: flux.store("EditorStore").getState(),
      team: flux.store("TeamStore").getState()
    };
  },

  componentDidMount: function() {
    if(!this.isAuthenticated()) {
      log.debug("Editor requires authentication");
      // if(!AuthUtil.triggerLogin()) {
      //   alert("Please authenticate manually by pressing the login button");
      //   log.warn("Could not trigger login, login form not found on page");
      // }
    }

    //init editor state, load component etc based on router parameters
    this.initFromParams();

    //initialisation for data grid
    this.getFlux().actions.loadTeams();
    this.getFlux().actions.loadEditorGridItems(this.state.editor.grid.space, this.state.editor.grid.team);
  },

  render: function () {
    return (
      <section id="editor">
        {this.renderContent()}
      </section>
    );
  },

  renderContent: function() {
    if(this.isAuthenticated()) {
      return (
          <div className="editorContainer">
            <EditorForm
                item={this.state.editor.item}
                type={this.state.editor.type}
                spec={this.state.details.spec}
                loading={this.state.details.loading}
                processing={this.state.editor.processing}
                expansionState={this.state.details.expansionState}
                linkedComponents={this.state.details.linkedComponents}
                selectedComponentId={this.state.editor.selectedComponentId}
                isNew={this.isNew()}
                onComponentToggle={this.doToggle /* from ComponentViewMixin */}
              />
            <div className="browserGroup">
              <DataGrid
                multiSelect={false}
                editMode={true}
                items={this.state.editor.grid.items}
                loading={this.state.editor.grid.loading}
                onRowSelect={this.handleGridRowSelect}
                />
              <div className="gridControls">
                <DataGridFilter
                  value={this.state.editor.grid.filterText}
                  onChange={this.handleGridFilterTextChange} />
                <SpaceSelector
                  type={Constants.TYPE_COMPONENT}
                  space={this.state.editor.grid.space}
                  teams={this.state.team.teams}
                  selectedTeam={this.state.editor.grid.team}
                  allowMultiSelect={false}
                  validUserSession={true}
                  componentsOnly={true}
                  onSpaceSelect={this.handleGridSpaceSelect}
                  onToggleMultipleSelect={null} />
              </div>
            </div>
          </div>
        );
    } else {
      // on mount, login should be triggered
      return <div>Login required to edit</div>;
    }
  },

  handleGridSpaceSelect: function(type, space, group) {
    this.getFlux().actions.switchEditorGridSpace(space, group);
    this.getFlux().actions.loadEditorGridItems(space, group);
  },

  handleGridFilterTextChange: function(evt) {
    this.getFlux().actions.setGridFilterText(evt.target.value);
  },

  handleGridRowSelect: function(itemId) {
    var targetComponentId = this.state.editor.selectedComponentId;
    if(targetComponentId == null) {
      //no selection? add to root component
      targetComponentId = this.state.details.spec.CMD_Component._appId;
    }
    // row selected means item should be added to selected component
    this.getFlux().actions.insertComponentById(this.state.details.spec, targetComponentId, itemId,
      function(newSpec) {
        // make sure the newly added linked component is loaded
        this.getFlux().actions.loadLinkedComponentSpecs(newSpec, this.state.details.linkedComponents);
      }.bind(this),
      function(error) {
        ReactAlert.showMessage("Cannot link component", error);
      }
    );
  },

  isAuthenticated: function() {
    return this.state.auth.authState.authenticated;
  },

  isNew: function() {
    var routes = this.props.routes;
    if(routes.length == 0) {
      log.error("No routes");
    }

    var path = routes[routes.length - 1].path;
    if(path == null) {
      log.error("No path for route", lastRoute);
    }
    return path.indexOf("editor/new") == 0 || path.indexOf("editor/component/new") == 0 || path.indexOf("editor/profile/new") == 0;
  },

  initFromParams: function() {
    var params = this.props.params;
    log.debug("Editor - location:", this.location, "params:", params);

    // set application state through actions, after this avoid using params directly

    // determine id - take either from componentId or profileId
    // may be null in case of a new item
    var id = params.componentId;
    if(id == undefined) {
      id = params.profileId;
    }

    // determine type
    var type;
    if(params.type != undefined) {
      type = params.type;
    } else if (params.componentId != undefined) {
      type = Constants.TYPE_COMPONENT;
    } else if (params.profileId != undefined) {
      type = Constants.TYPE_PROFILE;
    } else {
      log.error("Unknown type for editor", params);
    }

    var space = params.space;

    // initialise editor
    this.getFlux().actions.openEditor(type, space, id);

    // further initialisation of the editor depending on parameters
    if(this.isNew() && id == undefined) {
      log.debug("Creating new ", type);
      // create new component
      this.getFlux().actions.newComponentSpec(type, space);
      // create new item description
      this.getFlux().actions.newItem(type, space);
    } else {
      log.debug("Loading ", type, id);
      // load the spec for editing
      this.getFlux().actions.loadComponentSpec(type, id);
      // load the item for editing
      this.getFlux().actions.loadItem(type, id);
    }
  }
});

module.exports = Editor;
