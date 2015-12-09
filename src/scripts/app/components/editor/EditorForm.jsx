'use strict';

var log = require('loglevel');
var Constants = require("../../constants");

var React = require("react"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

//components
var ComponentSpecForm = require("./ComponentSpecForm"),
    EditorMenuGroup = require("./EditorMenuGroup"),
    DataGrid = require("../datagrid/DataGrid.jsx"),
    SpaceSelector = require("../datagrid/SpaceSelector.jsx"),
    DataGridFilter = require("../datagrid/DataGridFilter.jsx");

//mixins
var ComponentViewMixin = require('../../mixins/ComponentViewMixin');
var ComponentUsageMixin = require('../../mixins/ComponentUsageMixin');
var History = require("react-router").History;

//utils
var classNames = require('classnames');
var ReactAlert = require('../../util/ReactAlert');

/**
* EditorForm - Form routing endpoint for spec editor, either new/existing component/profile
* Routing params assumed: 'type' and 'componentId' OR 'profileId'
* @constructor
*/
var EditorForm = React.createClass({
  mixins: [FluxMixin, History, ComponentViewMixin, ComponentUsageMixin,
    StoreWatchMixin("ComponentDetailsStore", "EditorStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      details: flux.store("ComponentDetailsStore").getState(),
      editor: flux.store("EditorStore").getState(),
      team: flux.store("TeamStore").getState()
    };
  },

  childContextTypes: {
      validationListener: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      // here we can fetch validating inputs for triggering on save
      // (picked up from context by ValidatingTextInput components)
      validationListener: this.validationListener
    }
  },

  componentDidMount: function() {
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
      type = Constants.TYPE_COMPONENTS;
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
      // create new component
      this.getFlux().actions.newComponentSpec(type, space);
      // create new item description
      this.getFlux().actions.newItem(type, space);
    } else {
      // load the spec for editing
      this.getFlux().actions.loadComponentSpec(type, id);
      // load the item for editing
      this.getFlux().actions.loadItem(type, id);
    }

    this.getFlux().actions.loadTeams();
    this.getFlux().actions.loadEditorGridItems(this.state.editor.grid.space, this.state.editor.grid.team);
  },

  render: function () {
    if(this.state.details.loading || this.state.editor.item == null) {
      return (<div>Loading component...</div>);
    } else {
      var newItem = this.isNew();
      var editorClasses = classNames('editorGroup',
      {
        'processing': this.state.editor.processing,
        'open': true
      });
      return (
        <div className="editorContainer">
          <div className={editorClasses}>

            <div id="editorModal">{/* 'hook' for editor modals */}</div>

            <h3>
              {this.state.editor.type === Constants.TYPE_PROFILE
                ? (newItem?"New profile":"Edit profile")
                :(newItem?"New component":"Edit component")}
            </h3>

            <EditorMenuGroup
              isNew={newItem}
              onSave={this.handleSave}
              onSaveNew={this.handleSaveNew}
              onPublish={this.handlePublish}
              disabled={this.state.editor.processing}
            />

            <ComponentSpecForm
              spec={this.state.details.spec}
              item={this.state.editor.item}
              expansionState={this.state.details.expansionState}
              linkedComponents={this.state.details.linkedComponents}
              onComponentToggle={this.doToggle /* from ComponentViewMixin */}
              onTypeChange={this.setType}
              onHeaderChange={this.updateHeader}
              onItemChange={this.updateItem}
              onComponentChange={this.updateComponentSpec}
              onToggleSelection={this.handleToggleSelection}
              selectedComponentId={this.state.editor.selectedComponentId}
              />
          </div>
          <div className="browserGroup">
            <DataGridFilter
              value={this.state.editor.grid.filterText}
              onChange={this.handleGridFilterTextChange} />
            <SpaceSelector
              type={Constants.TYPE_COMPONENTS}
              space={this.state.editor.grid.space}
              teams={this.state.team.teams}
              selectedTeam={this.state.editor.grid.team}
              allowMultiSelect={false}
              validUserSession={true}
              componentsOnly={true}
              onSpaceSelect={this.handleGridSpaceSelect}
              onToggleMultipleSelect={null} />
            <DataGrid
              multiSelect={false}
              editMode={true}
              items={this.state.editor.grid.items}
              loading={this.state.editor.grid.loading}
              onRowSelect={this.handleGridRowSelect}
              />
            {/*deletedItems={this.state.items.deleted}*/}
          </div>
        </div>
      );
    }
  },

  // ACTION HANDLERS FOR CHILD COMPONENTS

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
      }.bind(this)
    );

  },

  handleToggleSelection: function(id) {
    this.getFlux().actions.toggleComponentSelection(id);
  },

  handleSave: function() {
    if(this.validateChildren()) {
      this.getFlux().actions.saveComponentSpec(this.state.details.spec, this.state.editor.item, this.afterSuccess, this.handleUsageWarning);
    }
  },

  handleSaveNew: function() {
    if(this.validateChildren()) {
      this.getFlux().actions.saveNewComponentSpec(this.state.details.spec, this.state.editor.item, this.afterSuccess);
    }
  },

  handlePublish: function() {
    if(this.validateChildren()) {
      this.getFlux().actions.publishComponentSpec(this.state.details.spec, this.state.editor.item, this.afterSuccess);
    }
  },

  afterSuccess: function() {
    this.history.pushState(null, "/browser");
  },

  setType: function(type) {
    this.getFlux().actions.setType(this.state.details.spec, type);
  },

  updateHeader: function(change) {
    this.getFlux().actions.updateHeader(this.state.details.spec, this.state.editor.item, change);
  },

  updateItem: function(change) {
    this.getFlux().actions.updateItem(this.state.editor.item, change);
  },

  updateComponentSpec: function(change) {
    this.getFlux().actions.updateSpec(this.state.details.spec, change);
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
    return path.indexOf("new") == 0 || path.indexOf("component/new") == 0 || path.indexOf("profile/new") == 0;
  },

  /**
   * Required by ComponentUsageMixin
   */
  renderUsageModalContent: function(errors, doContinue, doAbort) {
    return [(
      <Modal.Body key="body">
        <div className="modal-desc">
          <div>The component you are about to save is used by the following component(s) and/or profile(s):
            <ul>{errors}</ul>
          </div>
        </div>
      </Modal.Body>
    ), (
      <Modal.Footer key="footer">
          <div>Changes in this component will affect the above. Do you want to proceed?</div>
          <Button onClick={doContinue} bsStyle="primary">Yes</Button>
          <Button onClick={doAbort}>No</Button>
      </Modal.Footer>
    )];
  },

  // INPUT VALIDATION
  // This ensures that all validating inputs are locally validated once more
  // when trying to save or publish.
  validationListener: {
    add: function(item) {
      log.trace("Adding validation item", item);
      if(this.validationItems == null) {
        this.validationItems = [];
      }
      this.validationItems.push(item);
    },

    remove: function(item) {
      if($.isArray(this.validationItems)) {
        for(var i=0;i<(this.validationItems.length);i++) {
          if(this.validationItems[i] === item) {
            break;
          }
        }
        log.debug("Removing validation item", i, item);
        this.validationItems.splice(i, 1);
      }
    }
  },

  validateChildren: function() {
    var result = true;

    var validationItems = this.validationListener.validationItems;
    log.debug("Validating children:", validationItems);

    if(validationItems != null) {
      for(var i=0;i<(validationItems.length);i++) {
        var item = validationItems[i];
        log.debug("Validating", item);
        if(!item.doValidate()) {
          result = false;
        }
      }
    }
    if(!result) {
      ReactAlert.showMessage(this, "Validation errors", "There are validation errors, see the marked fields for details.");
    }
    return result;
  }


});

module.exports = EditorForm;
