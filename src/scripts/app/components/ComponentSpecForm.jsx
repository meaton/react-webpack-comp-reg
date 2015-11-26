'use strict';
var log = require('loglevel');

var React = require('react/addons');
var Router = require('react-router');
var Constants = require("../constants");

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ConceptLinkDialogueMixin = require('../mixins/ConceptLinkDialogueMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDComponentForm = require('./CMDComponentForm');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/ComponentViewer.sass');

/**
* ComponentViewer - view display and editing form for a CMDI Profile or Component item and its root properties, nested Components (CMDComponent), Elements, (CMDElement) and Attributes (CMDAttribute).
* @constructor
* @mixes ImmutableRenderMixin
* @LinkedStateMixin
* @BtnGroupEvents
* @Loader
* @ActionButtonsMixin
* @ValidationMixin
* @Router.Navigation
* @Router.State
*/
var ComponentSpecForm = React.createClass({
  mixins: [ImmutableRenderMixin, ConceptLinkDialogueMixin, Router.Navigation, Router.State],

  statics: {
    willTransitionTo: function(transition, params, query) {
      log.debug('attempting transition...' + transition.path);
    },
    willTransitionFrom: function(transition, component) {
      log.debug('transition from...' + this.path);
      // if(component.state.editMode && !component.state.isSaved)
      //   if(!confirm('You have unsaved work. Are you sure you want to cancel?'))
      //     transition.abort();
    }
  },

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    item: React.PropTypes.object.isRequired,
    expansionState: React.PropTypes.object,
    linkedComponents: React.PropTypes.object,
    onComponentToggle: React.PropTypes.func.isRequired,
    onTypeChange: React.PropTypes.func.isRequired,
    onHeaderChange: React.PropTypes.func.isRequired,
    onItemChange: React.PropTypes.func.isRequired,
    onComponentChange: React.PropTypes.func.isRequired,
    onToggleSelection: React.PropTypes.func.isRequired,
    selectedComponentId: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      domains: require('../../domains.js')
    };
  },

  render: function() {
    var spec = this.props.spec;
    var item = this.props.item;

    if(spec == null || item == null) {
      return (
        <div className="ComponentViewer loading" />
      );
    } else {
      var rootClasses = classNames({ ComponentViewer: true });
      var rootComponent = spec.CMD_Component;

      // Display properties
      var conceptLink = (rootComponent && rootComponent['@ConceptLink'] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent['@ConceptLink']}>{rootComponent['@ConceptLink']}</a></li> : null;
      var isProfile = (spec.hasOwnProperty("@isProfile")) ? (spec['@isProfile']=="true") : false;

      return (
        <form ref="editComponentForm" name="editComponent" id="editComponent" className="form-horizontal form-group">
          <div className="form-group">
            <Input type="radio" name="isProfile" label="Profile" value={Constants.TYPE_PROFILE} checked={isProfile} onChange={this.handleTypeChange} wrapperClassName="editorFormField" />
            <Input type="radio" name="isProfile" label="Component" value={Constants.TYPE_COMPONENTS} checked={!isProfile} onChange={this.handleTypeChange} wrapperClassName="editorFormField" />
          </div>
          <Input type="text" name="Name" label="Name" value={spec.Header.Name} onChange={this.handleHeaderChange} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
          <Input type="text" name="groupName" label="Group" value={item.groupName} onChange={this.handleItemChange} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
          <Input type="textarea" name="Description" label="Description" value={spec.Header.Description} onChange={this.handleHeaderChange} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
          <Input type="select" name="domainName" ref="rootComponentDomain" label="Domain" value={item.domainName} onChange={this.handleItemChange} labelClassName="editorFormLabel" wrapperClassName="editorFormField">
            <option value="">Select a domain...</option>
            {this.props.domains.map(function(domain, index) {
              return <option key={index} value={domain.data}>{domain.label}</option>
            })}
          </Input>
          <Input ref="conceptRegInput" type="text" label="ConceptLink" value={(spec.CMD_Component['@ConceptLink']) ? spec.CMD_Component['@ConceptLink'] : ""}
            labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.updateConceptLink} readOnly
            buttonAfter={this.newConceptLinkDialogueButton(this.updateConceptLink)}
            />
            <CMDComponentForm
              spec={spec.CMD_Component}
              hideProperties={true}
              onToggle={this.props.onComponentToggle}
              expansionState={this.props.expansionState}
              linkedComponents={this.props.linkedComponents}
              onToggleSelection={this.props.onToggleSelection}
              onComponentChange={this.handleComponentChange}
              selectedComponentId={this.props.selectedComponentId}
              />
          </form>
        );
    }
  },

  handleTypeChange: function(e) {
    //pass changes to handler, the event target is input "isProfile" (value either profile or component type constant)
    this.props.onTypeChange(e.target.value);
  },

  handleItemChange: function(e) {
    //pass changes to handler, input name maps to field name
    var field = e.target.name;
    var value = e.target.value;
    this.props.onItemChange({[field]: value});
  },

  handleHeaderChange: function(e) {
    //pass changes to handler, input name maps to field name
    var field = e.target.name;
    var value = e.target.value;
    this.props.onHeaderChange({[field]: value});
  },

  handleComponentChange: function(change) {
    //an update of the root component has been pushed up
    var update = {CMD_Component: change};
    this.props.onComponentChange(update);
  },

  updateConceptLink: function(val) {
    this.handleComponentChange({$merge: {['@ConceptLink']: val}});
  },

  //below: old functions
  updateValueScheme: function(target, prop, newValue) {
    console.log('update value scheme:' + target.constructor.displayName);

    var updateTypeFn = function(item) {
      var props = prop;

      if(props == undefined) props = "@ValueScheme";
      else if(props != "@ValueScheme" && props != "Type") props = "ValueScheme";

      if(props != '@ValueScheme' && item.hasOwnProperty('@ValueScheme'))
        delete item['@ValueScheme'];
      else if(props != "Type" && item.hasOwnProperty('Type'))
        delete item['Type'];
      else if(props != 'ValueScheme' && item.hasOwnProperty('ValueScheme'))
        delete item['ValueScheme'];

      if(props == '@ValueScheme' || props == 'Type')
        item[props] = newValue;
      else {
        item['ValueScheme'] = new Object();
        item['ValueScheme'][prop] = newValue;
      }

      return item;
    };

    if(target != undefined) {
      var updatedItem = null;

      if(target.constructor.displayName === "CMDAttribute")
        updatedItem = { attr: update(target.state.attr, { $apply: updateTypeFn }) };
      else if(target.constructor.displayName === "CMDElement")
        updatedItem = { elem: update(target.state.elem, { $apply: updateTypeFn }) };

      if(updatedItem != null)
        target.setState(updatedItem);
    }
  },
  handleUsageWarning: function(errors, cb) { // //TODO display components (non-profiles) that are linked?
    var self = this;
    var errors = this.processUsageErrors(errors);
    console.log('handleUsageWarning errors len(): ', errors.length);

    if(errors.length >= 1) {
      var saveContinue = function(evt) {
        self.closeAlert("alert-container", evt);
        cb(true);
      };

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
            <Button onClick={this.closeAlert.bind(this, "alert-container")}>No</Button>
          </div>
        </Modal>
      );

      this.renderAlert(instance, "alert-container");
    } // else console.warn('Expect a single error result to display, value: ', errors);
  }
});

module.exports = ComponentSpecForm;
