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
    EditorMenuGroup = require("./EditorMenuGroup");

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
    StoreWatchMixin("ComponentDetailsStore", "EditorStore", "TeamStore")],

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

  render: function () {
    if(this.state.details.loading || this.state.editor.item == null) {
      return (<div>Loading component...</div>);
    } else {
      var editorClasses = classNames('editorGroup',
      {
        'processing': this.state.editor.processing,
        'open': true
      });
      return (
        <div className={editorClasses}>

          {/* 'hook' for editor modals */}
          <div id="typeModalContainer"></div>
          <div id="ccrModalContainer"></div>

          <h3>
            {this.state.editor.type === Constants.TYPE_PROFILE
              ? (this.props.isNew?"New profile":"Edit profile")
              :(this.props.isNew?"New component":"Edit component")}
          </h3>

          <EditorMenuGroup
            isNew={this.props.isNew}
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
            onExpandAll={this.expandAll}
            onCollapseAll={this.collapseAll}
            />
        </div>
      );
    }
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

  /*=== Event handlers for child components ====*/


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

  expandAll: function(spec) {
    this.getFlux().actions.expandAll(spec);
  },

  collapseAll: function(spec) {
    this.getFlux().actions.collapseAll(spec);
  },

  /*=== Input validation ====
   * This ensures that all validating inputs are locally validated once more
   * when trying to save or publish
   */

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
      ReactAlert.showMessage("Validation errors", "There are validation errors, see the marked fields for details.");
    }
    return result;
  }


});

module.exports = EditorForm;
