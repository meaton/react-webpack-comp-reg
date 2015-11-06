'use strict';

var log = require('loglevel');
var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../mixins/CMDComponentMixin');
var ConceptLinkDialogueMixin = require('../mixins/ConceptLinkDialogueMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDComponentView = require('./CMDComponentView');
var CMDElementForm = require('./CMDElementForm');
var CMDAttributeForm = require('./CMDAttributeForm');

//utils
var classNames = require('classnames');

require('../../../styles/CMDComponent.sass');

/**
* CMDComponent - view display and editing form for a CMDI Component item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentForm = React.createClass({
  mixins: [ImmutableRenderMixin, CMDComponentMixin, ConceptLinkDialogueMixin],
  propTypes: {
    onComponentChange: React.PropTypes.func.isRequired
  },

  renderNestedComponent: function(spec, compId, isLinked, linkedSpecAvailable, index) {
    if(isLinked) {
      if(linkedSpecAvailable) {
        return (<CMDComponentView
          key={spec._appId}
          spec={spec}
          parent={this.props.spec}
          expansionState={this.props.expansionState}
          linkedComponents={this.props.linkedComponents}
          onToggle={this.props.onToggle}
          isLinked={isLinked}
          />);
      } else {
        return (<div key={compId}>Component {compId} loading...</div>);
      }
    } else {
      // forward child expansion state
      return (<CMDComponentForm
        key={spec._appId}
        spec={spec}
        parent={this.props.spec}
        expansionState={this.props.expansionState}
        linkedComponents={this.props.linkedComponents}
        onToggle={this.props.onToggle}
        isLinked={isLinked}
        onComponentChange={this.handleComponentChange.bind(this, index)}
        />);
    }
  },

  renderAttribute: function(attr, index) {
    return <CMDAttributeForm key={attr._appId} spec={attr} />;
  },

  renderAfterAttributes: function() {
    return <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute}>+Attribute</a></div>;
  },

  renderElement: function(elem, index) {
    return <CMDElementForm
              key={elem._appId}
              spec={elem}
              onElementChange={this.handleElementChange.bind(this, index)} />;
  },

  renderAfterElements: function() {
    return <div className="addElement"><a onClick={this.addNewElement}>+Element</a></div>
  },

  renderAfterComponents: function() {
    return <div className="addComponent"><a onClick={this.addNewComponent}>+Component</a></div>;
  },

  renderComponentProperties: function(comp) {
    var compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    var cardOpt = null;

    if(!this.isOpen()) {
      cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );
    }

    var editClasses = null; //TODO determine classes?
    var componentClasses = classNames('CMDComponent', { 'edit-mode': true, 'open': this.isOpen(), 'selected': false /*TODO selection state*/ });

    return (
      <div>
        {/* TODO: actionButtons (from ActionButtonsMixin) */}
        {/* TODO: selectionLink
          <div className="controlLinks"><a onClick={this.toggleSelection}>{(this.state.isSelected) ? "unselect" : "select"}</a></div>
        */}
        <span>ComponentId: <a className="componentLink" onClick={this.toggleComponent}>{compName}</a></span> {cardOpt}
        <div className={editClasses}>
          <div>
            <Input type="text" name="@name" label="Name" value={comp['@name']} onChange={this.updateComponentValue} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
            <Input ref="conceptRegInput" type="text" label="ConceptLink" value={(comp['@ConceptLink']) ? comp['@ConceptLink'] : ""}
              labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.updateConceptLink} readOnly
              buttonAfter={this.newConceptLinkDialogueButton(this.updateConceptLink)}
              />
          </div>
          <Input type="select" name="@CardinalityMin" label="Min Occurrences" value={minC} labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.updateComponentValue}>
            <option value="unbounded">unbounded</option>
            {$.map($(Array(10)), function(item, index) {
              return <option key={index} value={index}>{index}</option>
            })}
          </Input>
          <Input type="select" name="@CardinalityMax" label="Max Occurrences" value={maxC} labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.updateComponentValue}>
            <option value="unbounded">unbounded</option>
            {$.map($(Array(10)), function(item, index) {
              return <option key={index} value={index}>{index}</option>
            })}
          </Input>
        </div>
      </div>
    );
  },

  /* Methods that handle changes (in this component and its children) */

  handleComponentChange: function(index, change) {
    //an update of the child component at [index] has been requested, push up
    this.props.onComponentChange({CMD_Component: {[index]: change}});
  },

  handleElementChange: function(index, change) {
    var update = {CMD_Element: {[index]: change}};
    log.trace("Update element", update);
    this.props.onComponentChange(update);
  },

  propagateComponentValue: function(field, value) {
    //send 'command' to merge existing spec section with this delta
    //(see https://facebook.github.io/react/docs/update.html)
    log.trace("Update component field:", field, "to:", value);
    this.props.onComponentChange({$merge: {[field]: value}});
  },

  updateComponentValue: function(e) {
    //a property of this component has changed
    this.propagateComponentValue(e.target.name, e.target.value);
  },

  updateConceptLink: function(value) {
    this.propagateComponentValue('@ConceptLink', value);
  },

  /* Methods that add new children */
  addNewComponent: function(evt) {
    var spec = this.props.spec;
    var appId = spec._appId + "/new_" + (spec.CMD_Component == null ? 0 : spec.CMD_Component.length);
    var newComp = { "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", "_appId": appId };
    log.debug("Adding new component to", spec._appId, newComp);
    if(spec.CMD_Component == null) {
      this.props.onComponentChange({$merge: {CMD_Component: [newComp]}});
    } else {
      this.props.onComponentChange({CMD_Component: {$push: [newComp]}});
    }
  },

















  //below: old functions
  toggleSelection: function(evt) {
    if(this.state.isInline) { // selection inline components only
      var updatedComponent = update(this.state.component, { $merge: { selected: !this.state.isSelected } });
      this.setState({ component: updatedComponent, isSelected: !this.state.isSelected });
    }
  },
  addNewAttribute: function(evt) {
    console.log(this.constructor.displayName, 'new Attribute');
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format

    var comp = this.state.component;
    if(comp != null)
      if(comp.Header != undefined)
        comp = comp.CMD_Component;

    var attrList = comp.AttributeList;
    if(attrList != undefined && $.isArray(attrList.Attribute)) attrList = attrList.Attribute;
    if(attrList != undefined && !$.isArray(attrList)) attrList = [attrList];

    //console.log('attrList: ' + attrList);

    var item = (attrList == undefined) ?
      update(comp, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
      update(comp, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    //console.log('new item after attr add: ' + JSON.stringify(item));

    if(this.state.component != null)
      if(this.state.component.Header != undefined)
        this.setState({ component: update(this.state.component, { CMD_Component: { $set: item } }) });
      else
        this.setState({ component: item });
  },
  addNewElement: function(evt) {
    console.log(this.constructor.displayName, 'new Element');

    var component = this.state.component;
    if(component.CMD_Element == undefined) component.CMD_Element = [];

    var updatedComponent = update(component, { $merge: { CMD_Element: update(component.CMD_Element, { $push: [ { "@name": "", "@ConceptLink": "", "@ValueScheme": "string", "@CardinalityMin": "1", "@CardinalityMax": "1", "@Multilingual": "false", open: true } ] }) }});

    this.setState({ component: updatedComponent });
  }
});

module.exports = CMDComponentForm;
