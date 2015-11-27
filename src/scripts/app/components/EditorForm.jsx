'use strict';

var log = require('loglevel');
var Constants = require("../constants");

var React = require("react"),
    Router = require('react-router'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');

//components
var ComponentSpecForm = require("./ComponentSpecForm"),
    EditorMenuGroup = require("./EditorMenuGroup"),
    DataGrid = require("./DataGrid.jsx"),
    SpaceSelector = require("./SpaceSelector.jsx");

//mixins
var ComponentViewMixin = require('../mixins/ComponentViewMixin');

//utils
var classNames = require('classnames');

/**
* EditorForm - Form routing endpoint for spec editor, either new/existing component/profile
* Params assumed: 'type' and 'componentId' OR 'profileId'
* @constructor
*/
var EditorForm = React.createClass({
  mixins: [FluxMixin, Router.Navigation, Router.State, ComponentViewMixin,
    StoreWatchMixin("ComponentDetailsStore", "EditorStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      details: flux.store("ComponentDetailsStore").getState(),
      editor: flux.store("EditorStore").getState()
    };
  },

  componentDidMount: function() {
    var params = this.getParams();
    log.debug("Editor - path:", this.getPathname(), "params:", params);

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

    this.getFlux().actions.openEditor(type, space, id);

    if(this.isNew() && id == undefined) {
      // create new component
      this.getFlux().actions.newComponentSpec(type, space);
      // create new item description
      this.getFlux().actions.newItem(type, space);
    } else {
      // load the spec for editing
      this.getFlux().actions.loadComponentSpec(type, space, id);
      // load the item for editing
      this.getFlux().actions.loadItem(type, space, id);
    }

    this.getFlux().actions.loadEditorGridItems(this.state.editor.grid.space);
  },

  render: function () {
    if(this.state.details.loading) {
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

            <h3>
              {this.state.editor.type === Constants.TYPE_PROFILE
                ? (newItem?"New profile":"Edit profile")
                :(newItem?"New component":"Edit component")}

                &nbsp;in &quot;{this.state.editor.space}&quot;</h3>

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
              onComponentToggle={this.toggleItem}
              onTypeChange={this.setType}
              onHeaderChange={this.updateHeader}
              onItemChange={this.updateItem}
              onComponentChange={this.updateComponentSpec}
              onToggleSelection={this.handleToggleSelection}
              selectedComponentId={this.state.editor.selectedComponentId}
              />
          </div>
          <div className="browserGroup">
            <SpaceSelector
              type="componentsOnly"
              allowMultiSelect={false}
              validUserSession={true}
              space={this.state.editor.grid.space}
              onSpaceSelect={this.handleGridSpaceSelect}
              onToggleMultipleSelect={null /*this.handleToggleMultipleSelect*/} />
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

  handleGridSpaceSelect: function(type, space) {
    this.getFlux().actions.switchEditorGridSpace(space);
    this.getFlux().actions.loadEditorGridItems(space);
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
        this.getFlux().actions.loadLinkedComponentSpecs(newSpec, this.state.editor.space, this.state.details.linkedComponents);
      }.bind(this)
    );

  },

  handleToggleSelection: function(id) {
    this.getFlux().actions.toggleComponentSelection(id);
  },

  toggleItem: function(itemId, spec, defaultState) {
    // from ComponentViewMixin
    this.doToggle(this.state.editor.space, itemId, spec, defaultState);
  },

  handleSave: function() {
    this.getFlux().actions.saveComponentSpec(this.state.details.spec, this.state.editor.item, this.state.editor.space, this.afterSuccess, this.handleUsageWarning);
  },

  handleSaveNew: function() {
    this.getFlux().actions.saveNewComponentSpec(this.state.details.spec, this.state.editor.item, this.state.editor.space, this.afterSuccess);
  },

  handlePublish: function() {
    this.getFlux().actions.publishComponentSpec(this.state.details.spec, this.state.editor.item, this.state.editor.space, this.afterSuccess);
  },

  afterSuccess: function() {
    this.transitionTo("browser");
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
    var routes = this.getRoutes();
    var lastRoute = routes[routes.length - 1];
    return lastRoute.name === "newEditor"
            || lastRoute.name === "newComponent"
            || lastRoute.name === "newProfile";
  },

  handleUsageWarning: function(errors, cbYes, cbNo) {
    var errors = this.processUsageErrors(errors);

    if(errors.length >= 1) {
      var saveContinue = function(evt) {
        this.closeAlert("alert-container", evt);
        cbYes(true);
      }.bind(this);

      var abort = function(evt) {
        this.closeAlert("alert-container", evt);
        cbNo(true);
      }.bind(this);

      var instance = (
        <Modal title={"Component is used"}
          enforceFocus={true}
          backdrop={true}
          animation={false}
          container={this}
          onRequestHide={this.closeAlert.bind(this, "alert-container")}>
          <div className="modal-body">
            <div className="modal-desc">
              <div>The component you are about to save is used by the following component(s) and/or profile(s):
                <ul>{errors}</ul>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div>Changes in this component will affect the above. Do you want to proceed?</div>
            <Button onClick={saveContinue} bsStyle="primary">Yes</Button>
            <Button onClick={abort}>No</Button>
          </div>
        </Modal>
      );

      this.renderAlert(instance, "alert-container");
    }
  },

  processUsageErrors: function(errors) {
    var li = React.DOM.li;
    var errorsReactDOM = [];

    if(errors != undefined && !$.isArray(errors))
      errors = [errors];

    if(errors != undefined && errors.length > 0)
      for(var i=0; i < errors.length; i++)
        if(errors[i].result != undefined) {
          if(!$.isArray(errors[i].result))
            errors[i].result = [errors[i].result];
          for(var j=0; j < errors[i].result.length; j++) //TODO unique profile names referenced or show profiles used by each matched component
            errorsReactDOM.push(li({ key: errors[i].componentId + "_profile:" + errors[i].result[j].id }, errors[i].result[j].name));
        }

    return errorsReactDOM;
  },

  renderAlert: function(instance, elementId) {
    var div = React.DOM.div;
    if(instance && elementId)
      React.render(div({ className: 'static-modal' }, instance), document.getElementById(elementId));
    else
      log.error('Cannot render Alert dialog: ', elementId);
  },

  closeAlert: function(elementId, evt) {
    if(evt) evt.stopPropagation();
    if(elementId)
      React.unmountComponentAtNode(document.getElementById(elementId));
    else
      log.error('Cannot unmount Alert dialog: ', elementId);
  }
});

module.exports = EditorForm;
