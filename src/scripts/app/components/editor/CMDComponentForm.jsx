'use strict';

var log = require('loglevel');
var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../../mixins/CMDComponentMixin');
var ToggleExpansionMixin = require('../../mixins/ToggleExpansionMixin');
var ConceptLinkDialogueMixin = require('../../mixins/ConceptLinkDialogueMixin');
var SpecFormUpdateMixin = require('../../mixins/SpecFormUpdateMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDElementForm = require('./CMDElementForm');
var CMDAttributeForm = require('./CMDAttributeForm');
var CardinalityInput = require('./CardinalityInput');
var ActionButtons = require('./ActionButtons');
var ValidatingTextInput = require('./ValidatingTextInput');
var CMDComponentView = require('../browser/CMDComponentView');

//utils
var classNames = require('classnames');
var Validation = require('../../service/Validation');

require('../../../../styles/CMDComponent.sass');

/**
* CMDComponentForm - editing form for a CMDI Component item, including (part of)
* the root component
*
* @constructor
* @mixes ImmutableRenderMixin
* @mixes CMDComponentMixin
* @mixes SpecFormUpdateMixin
* @mixes ConceptLinkDialogueMixin
*/
var CMDComponentForm = React.createClass({
  mixins: [ImmutableRenderMixin,
            CMDComponentMixin,
            ToggleExpansionMixin,
            ConceptLinkDialogueMixin,
            SpecFormUpdateMixin,
            ActionButtonsMixin],

  propTypes: {
    onComponentChange: React.PropTypes.func.isRequired,
    onToggleSelection: React.PropTypes.func.isRequired,
    selectedComponentId: React.PropTypes.string
    /* more props defined in CMDComponentMixin, ToggleExpansionMixin and ActionButtonsMixin */
  },

  getDefaultProps: function() {
    return {
      renderChildrenWhenCollapsed: true
    };
  },

  /**
   * used by CMDComponentMixin
   */
  isSelected: function() {
    return this.props.spec._appId === this.props.selectedComponentId;
  },

  /**
   * Components should always be open by default
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return true;
  },

  /*=== Functions that handle changes (in this component and its children) ===*/

  propagateValue: function(field, value) {
    //send 'command' to merge existing spec section with this delta
    //(see https://facebook.github.io/react/docs/update.html)
    log.trace("Update component field:", field, "to:", value);
    this.props.onComponentChange({$merge: {[field]: value}});
  },

  handleComponentChange: function(index, change) {
    //an update of the child component at [index] has been requested, push up
    this.props.onComponentChange({CMD_Component: {[index]: change}});
  },

  handleElementChange: function(index, change) {
    var update = {CMD_Element: {[index]: change}};
    log.trace("Update element", update);
    this.props.onComponentChange(update);
  },

  updateComponentValue: function(e) {
    //a property of this component has changed
    this.propagateValue(e.target.name, e.target.value);
  },

  /*=== Functions that add new children ===*/

  addNewComponent: function(evt) {
    var spec = this.props.spec;
    var appId = this.generateAppIdForNew(spec._appId, spec.CMD_Component);
    var newComp = { "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", "_appId": appId };
    log.debug("Adding new component to", spec._appId, newComp);
    if(spec.CMD_Component == null) {
      this.props.onComponentChange({$merge: {CMD_Component: [newComp]}});
    } else {
      this.props.onComponentChange({CMD_Component: {$push: [newComp]}});
    }
  },

  addNewElement: function(evt) {
    var spec = this.props.spec;
    var appId = this.generateAppIdForNew(spec._appId, spec.CMD_Element);
    var newElem = { "@name": "", "@ConceptLink": "", "@ValueScheme": "string", "@CardinalityMin": "1", "@CardinalityMax": "1", "@Multilingual": "false", "_appId": appId };
    log.debug("Adding new element to", spec._appId, newElem);
    if(spec.CMD_Element == null) {
      this.props.onComponentChange({$merge: {CMD_Element: [newElem]}});
    } else {
      this.props.onComponentChange({CMD_Element: {$push: [newElem]}});
    }
  },

  /*=== Render functions ===*/

  /* main render() function in CMDComponentMixin */

  renderComponentProperties: function(comp) {
    var open = this.isOpen();
    log.trace("Component", this.props.spec._appId, " open state:", open);

    var compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];
    var cardOpt = !open? ( <span>Cardinality: {(comp['@CardinalityMin'] || 1) + " - " + (comp['@CardinalityMax'] || 1)}</span> ) : null;
    var editClasses = null; //TODO determine classes?

    var editableProps = open?(
      <div className={editClasses}>
        <ValidatingTextInput type="text" name="@name" label="Name" value={comp['@name']}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField"
          onChange={this.updateComponentValue} validate={this.validate}  />
        <ValidatingTextInput type="text" name="@ConceptLink" label="ConceptLink" value={(comp['@ConceptLink']) ? comp['@ConceptLink'] : ""}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" ref="conceptRegInput"
          onChange={this.updateComponentValue} validate={this.validate}
          buttonAfter={this.newConceptLinkDialogueButton(this.updateConceptLink)} />
        <CardinalityInput min={comp['@CardinalityMin']} max={comp['@CardinalityMax']} onValueChange={this.updateComponentValue} />
      </div>
    ) : null;

    var appId = this.props.spec._appId;
    return (
      <div>
        {this.createActionButtons({
          onToggleSelection: this.props.onToggleSelection.bind(null, appId),
          isSelected: appId === this.props.selectedComponentId
        })}
        <span>Component: <span class="componentName">{compName}</span></span> {cardOpt}
        {editableProps}
      </div>
    );
  },

  renderNestedComponent: function(spec, compId, isLinked, linkedSpecAvailable, index) {
    // component to render depends on whether it is linked (view) or inline (form)

    // common properties (for both view and form)
    var componentProperties = {
      key: spec._appId + "_" +index,
      spec: spec,
      parent: this.props.spec,
      linkedComponents: this.props.linkedComponents,
      isLinked: isLinked,
      onMove: this.handleMoveComponent.bind(this, this.props.onComponentChange, index),
      onRemove: this.handleRemoveComponent.bind(this, this.props.onComponentChange, index),
      isFirst: index == 0,
      isLast: index == this.props.spec.CMD_Component.length - 1
    };

    if(isLinked) {
      if(linkedSpecAvailable) {
        // linked components do not get a form
        return (<CMDComponentView
          {... componentProperties}
          {... this.getExpansionProps()} /* from ToggleExpansionMixin*/
          actionButtons={
            <ActionButtons
              onMove={this.handleMoveComponent.bind(this, this.props.onComponentChange, index)}
              onRemove={this.handleRemoveComponent.bind(this, this.props.onComponentChange, index)}
              moveUpEnabled={index != 0}
              moveDownEnabled={index != this.props.spec.CMD_Component.length - 1} />
          }
          />);
      } else {
        return (<div className="CMDComponent" key={compId + "_" + index}>Component {compId} loading...</div>);
      }
    } else {
      // inline child components do get a form
      return (<CMDComponentForm
        {... componentProperties}
        {... this.getExpansionProps() /* from ToggleExpansionMixin*/}
        selectedComponentId={this.props.selectedComponentId}
        onComponentChange={this.handleComponentChange.bind(this, index)}
        onToggleSelection={this.props.onToggleSelection}
        checkUniqueName={Validation.checkUniqueSiblingName.bind(this, this.props.spec.CMD_Component)}
        />);
    }
  },

  renderElement: function(elem, index) {
    return <CMDElementForm
              key={elem._appId}
              spec={elem}
              onElementChange={this.handleElementChange.bind(this, index)}
              onMove={this.handleMoveElement.bind(this, this.props.onComponentChange, index)}
              onRemove={this.handleRemoveElement.bind(this, this.props.onComponentChange, index)}
              isFirst={index == 0}
              isLast={index == this.props.spec.CMD_Element.length - 1}
              checkUniqueName={Validation.checkUniqueSiblingName.bind(this, this.props.spec.CMD_Element)}
              {... this.getExpansionProps() /* from ToggleExpansionMixin*/}
              />;
  },

  renderAttribute: function(attr, index) {
    return <CMDAttributeForm
              key={attr._appId} spec={attr}
              onAttributeChange={this.handleAttributeChange.bind(this, this.props.onComponentChange, index)}
              onMove={this.handleMoveAttribute.bind(this, this.props.onComponentChange, index)}
              onRemove={this.handleRemoveAttribute.bind(this, this.props.onComponentChange, index)}
              isFirst={index == 0}
              isLast={index == this.props.spec.AttributeList.Attribute.length - 1}
              checkUniqueName={Validation.checkUniqueSiblingName.bind(this, this.props.spec.AttributeList.Attribute)}
              {... this.getExpansionProps() /* from ToggleExpansionMixin*/}
       />;
  },

  renderAfterComponents: function() {
    return <div className="addComponent"><a onClick={this.addNewComponent}>+Component</a></div>;
  },

  renderAfterElements: function() {
    return <div className="addElement"><a onClick={this.addNewElement}>+Element</a></div>
  },

  renderAfterAttributes: function() {
    return <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute.bind(this, this.props.onComponentChange)}>+Attribute</a></div>;
  },

  validate: function(val, targetName, feedback) {
    return Validation.validateField('component', targetName, val, feedback)
      && (targetName != '@name' || this.props.checkUniqueName(targetName, val, feedback));
  }
});

module.exports = CMDComponentForm;
