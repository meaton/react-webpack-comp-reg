'use strict';

var log = require('loglevel');
var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../../mixins/CMDComponentMixin');
var ToggleExpansionMixin = require('../../mixins/ToggleExpansionMixin');
var ConceptLinkDialogueMixin = require('../../mixins/ConceptLinkDialogueMixin');
var SpecFormUpdateMixin = require('../../mixins/SpecFormUpdateMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');

//components
var CMDElementForm = require('./CMDElementForm');
var CMDAttributeForm = require('./CMDAttributeForm');
var CardinalityInput = require('./CardinalityInput');
var ValidatingTextInput = require('./ValidatingTextInput');
var CMDComponentView = require('../browser/CMDComponentView');

//utils
var classNames = require('classnames');
var Validation = require('../../service/Validation');
var changeObj = require('../../util/ImmutabilityUtil').changeObj;

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
    onStartComponentLink: React.PropTypes.func.isRequired,
    selectedComponentId: React.PropTypes.string,
    overrideSelect: React.PropTypes.bool
    /* more props defined in CMDComponentMixin, ToggleExpansionMixin and ActionButtonsMixin */
  },

  getDefaultProps: function() {
    return {
      renderChildrenWhenCollapsed: true,
      overrideSelect: false
    };
  },

  /**
   * used by CMDComponentMixin
   */
  isSelected: function() {
    return this.props.overrideSelect || this.props.spec._appId === this.props.selectedComponentId;
  },

  /**
   * Components should always be open by default
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return true;
  },

  /*=== Render functions ===*/

  /* main render() function in CMDComponentMixin */

  renderComponentProperties: function(comp) {
    var open = this.isOpen();
    log.trace("Component", this.props.spec._appId, " open state:", open);

    var compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];
    var cardOpt = !open? ( <span>&nbsp;[{(comp['@CardinalityMin'] || 1) + " - " + (comp['@CardinalityMax'] || 1)}]</span> ) : null;

    var editableProps = open?(
      <div className="panel-body componentProps">
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
    var title = <span>Component: <span className="componentName">{compName}</span> {cardOpt}</span>;
    return (
      <div className="panel panel-info">
        <div className="panel-heading">
        {this.createActionButtons({
          title: title,
          isSelected: this.isSelected()
        })}
        </div>
        {editableProps}
      </div>
    );
  },

  renderNestedComponent: function(spec, compId, isLinked, linkedSpecAvailable, index) {
    // component to render depends on whether it is linked (view) or inline (form)

    // common properties (for both view and form)
    var componentProperties = {
      key: spec._appId,
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
        // linked components do not get a full form, but cardinality can be edited
        var link = this.props.spec.CMD_Component[index];
        var minC = link['@CardinalityMin'];
        if(minC == null) minC = "1";
        var maxC = link['@CardinalityMax'];
        if(maxC == null) maxC = "1";
        // we're hiding the cardinality in the view and replacing it with an inline form
        var formElements = (
          <div className="componentProps">
            <CardinalityInput min={minC} max={maxC} onValueChange={this.updateChildComponentValue.bind(this, index)} />
          </div>
        );

        return (
          <div key={componentProperties.key + "_linkform"} className="linkedComponentForm">
            <CMDComponentView
              link={link}
              hideCardinality={true}
              formElements={formElements}
              {... componentProperties}
              {... this.getExpansionProps()} /* from ToggleExpansionMixin*/
            />
          </div>
          );
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
        onStartComponentLink={this.props.onStartComponentLink}
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
              index={index}
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
    return (
      <div>
        {this.isSelected() && <div className="componentInsertionTarget" title="Use the table below to link a component into this component">Added component will be inserted here</div>}
        {this.isOpen() && /*TODO: turn into nice dropdown*/
          <div className="addComponent">
            <a onClick={this.addNewComponent}>+Component</a><br />
            <a onClick={this.props.onStartComponentLink.bind(null, this.props.spec._appId)}>+Existing component</a>
          </div>}
      </div>
    );
  },

  renderAfterElements: function() {
    return this.isOpen() ? <div className="addElement"><a onClick={this.addNewElement}>+Element</a></div> : null;
  },

  renderAfterAttributes: function() {
    return this.isOpen() ? <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute.bind(this, this.props.onComponentChange)}>+Attribute</a></div> : null;
  },

  wrapNestedComponents: function(components) {
    return (
      <ReactCSSTransitionGroup transitionName="editor-items" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {components}
      </ReactCSSTransitionGroup>
    );
  },

  wrapElements: function(elements) {
    return (
      <ReactCSSTransitionGroup transitionName="editor-items" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {elements}
      </ReactCSSTransitionGroup>
    );
  },

  wrapAttributes: function(attributes) {
    return (
      <ReactCSSTransitionGroup transitionName="editor-items" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {attributes}
      </ReactCSSTransitionGroup>
    );
  },

  /*=== Functions that handle changes (in this component and its children) ===*/

  propagateValue: function(field, value) {
    //send 'command' to merge existing spec section with this delta
    //(see https://facebook.github.io/react/docs/update.html)
    log.trace("Update component field:", field, "to:", value);
    this.props.onComponentChange({$merge: changeObj(field, value)});
  },

  handleComponentChange: function(index, change) {
    //an update of the child component at [index] has been requested, push up
    this.props.onComponentChange({CMD_Component: changeObj(index, change)});
  },

  handleElementChange: function(index, change) {
    var update = {CMD_Element: changeObj(index, change)};
    log.trace("Update element", update);
    this.props.onComponentChange(update);
  },

  updateComponentValue: function(e) {
    //a property of this component has changed
    this.propagateValue(e.target.name, e.target.value);
  },

  updateChildComponentValue: function(index, e) {
    var field = e.target.name;
    var value = e.target.value;
    log.debug("Update property of child component",index,field,"=",value);
    this.handleComponentChange(index, {$merge: changeObj(field, value)});
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

  /*=== Validation of field values ====*/

  validate: function(val, targetName, feedback) {
    return Validation.validateField('component', targetName, val, feedback)
      && (targetName != '@name' || this.props.checkUniqueName(targetName, val, feedback));
  }
});

module.exports = CMDComponentForm;
