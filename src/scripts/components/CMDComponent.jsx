'use strict';

var React = require('react/addons');
var ImmutableRenderMixin = require('react-immutable-render-mixin');

var LinkedStateMixin = require('../mixins/LinkedStateMixin');
var ActionButtonsMixin = require('../mixins/ActionButtonsMixin');

var CMDElement = require('./CMDElement');
var CMDAttribute = require('./CMDAttribute');

var Input = require('react-bootstrap/lib/Input');

var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../styles/CMDComponent.sass');

var CMDComponent = React.createClass({
  mixins: [ImmutableRenderMixin, LinkedStateMixin, ActionButtonsMixin],
  getInitialState: function() {
    return { component: this.props.component,
             componentName: (this.props.component.Header != undefined) ? this.props.component.Header.Name : null,
             editMode: (this.props.editMode != undefined) ? this.props.editMode : false,
             isInline: false,
             isSelected: (this.props.component.selected != undefined) ? this.props.component.selected : false }
  },
  toggleComponent: function(evt) {
    console.log('toggle component: ' + JSON.stringify(this.state.component));
    if((!this.state.component.hasOwnProperty('open') || !this.state.component.open) &&
       this.state.component.hasOwnProperty('@ComponentId') && this.state.component.Header == undefined)
       this.loadComponentData();
    else {
      var isOpen = (this.state.component.hasOwnProperty('open')) ? !this.state.component.open : true;
      this.setState({ component: update(this.state.component, { open: { $set: isOpen }}) });
    }
  },
  toggleSelection: function(evt) {
    if(this.state.isInline) { // selection inline components only
      var updatedComponent = update(this.state.component, { $merge: { selected: !this.state.isSelected } });
      this.setState({ component: updatedComponent, isSelected: !this.state.isSelected });
    }
  },
  loadComponentData: function() {
    var self = this;
    var comp = this.state.component;
    this.props.viewer.loadComponent(this.state.component["@ComponentId"], "json", function(data) { //TODO: use common load child Component spec fn callback as in viewer
          console.log('data child comp: ' + (data.CMD_Component != null));
          data.CMD_Component = update(data.CMD_Component, { $merge: {'@CardinalityMin': (comp.hasOwnProperty("@CardinalityMin")) ? comp["@CardinalityMin"] : 1, '@CardinalityMax': (comp.hasOwnProperty("@CardinalityMax")) ? comp["@CardinalityMax"] : 1}})

          var newComponent = update(data, { open: { $set: true } });
          self.setState({component: newComponent });
      });
  },
  addNewAttribute: function(evt) {
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format

    var comp = this.state.component;
    if(comp != null)
      if(comp.Header != undefined)
        comp = comp.CMD_Component;

    var attrList = comp.AttributeList;
    if(attrList != undefined && $.isArray(attrList.Attribute)) attrList = attrList.Attribute;
    if(attrList != undefined && !$.isArray(attrList)) attrList = [attrList];

    console.log('attrList: ' + attrList);
    var item = (attrList == undefined) ?
      update(comp, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
      update(comp, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    console.log('new item after attr add: ' + JSON.stringify(item));
    if(this.state.component != null)
      if(this.state.component.Header != undefined)
        this.setState({ component: update(this.state.component, { CMD_Component: { $set: item } }) });
      else
        this.setState({ component: item });
  },
  addNewElement: function(evt) {
    console.log('new Element');
    var component = this.state.component;
    if(component.CMD_Element == undefined) component.CMD_Element = [];

    var updatedComponent = update(component, { $merge: { CMD_Element: update(component.CMD_Element, { $push: [ { "@name": "", "@ConceptLink": "", "@ValueScheme": "string", "@CardinalityMin": "1", "@CardinalityMax": "1", "@Multilingual": "false", open: true } ] }) }});

    this.setState({ component: updatedComponent });
  },
  addNewComponent: function(evt) {
    console.log('new Component');
    this.addDefinedComponent({ "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", open: true });
  },
  addDefinedComponent: function(component) {
    console.log('defined component: ' + JSON.stringify(component));
    var existingComponent = this.state.component;
    var newComponents = (existingComponent.CMD_Component == undefined) ? [component] : update(existingComponent.CMD_Component, { $push: [component] });
    var updateComponent = update(existingComponent, { CMD_Component: { $set: newComponents } });

    this.setState({ component: updateComponent });
  },
  updateAttribute: function(index, newAttr) {
    console.log('attr update: ' + index);
    var item = this.state.component;
    if(item != null && this.state.isInline) {
      var attrSet = item.AttributeList;
      if(attrSet != undefined && attrSet.Attribute != undefined) attrSet = attrSet.Attribute;
      if(!$.isArray(attrSet)) attrSet = [attrSet];
      attrSet[index] = newAttr;

      this.setState({ component: update(item, { AttributeList: { $set: { Attribute: attrSet } }}) });
    }
  },
  updateElement: function(index, newElement) {
    var linkChild = (this.state.component.Header != undefined) ?
      this.linkState('component.CMD_Component.CMD_Element.' + index) :
      this.linkState('component.CMD_Element.' + index);

    linkChild.requestChange(newElement);
  },
  updateComponentSettings: function(index, newMin, newMax) {
    console.log('comp update: ' + index);
    var component = this.state.component;
    var child = (component.Header != undefined) ? component.CMD_Component.CMD_Component[index] : component.CMD_Component[index];

    if(newMin != null) child['@CardinalityMin'] = newMin;
    if(newMax != null) child['@CardinalityMax'] = newMax;

    var linkChild = this.linkState('component.' + index);
    linkChild.requestChange(child);
  },
  updateParent: function(index, newComponent) {
    console.log('update nested component: ' + require('util').inspect(newComponent));
    var linkChild = (this.state.component.Header != undefined) ?
      this.linkState('component.CMD_Component.CMD_Component.' + index) :
      this.linkState('component.CMD_Component.' + index);

    linkChild.requestChange(newComponent);
  },
  updateInlineComponent: function(index, newComponent) {
    this.updateParent(index, newComponent);
  },
  updateConceptLink: function(newValue) {
    if(typeof newValue === "string" && this.state.component != null)
      this.setState({ component: (this.state.component.Header != undefined) ?
        update(this.state.component, { 'CMD_Component': { $merge: { '@ConceptLink': newValue } } }) :
        update(this.state.component, { $merge: {  '@ConceptLink': newValue } })
      });
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('component will received new props');

    var component = this.state.component;
    console.log('component props: ' + JSON.stringify(nextProps.component));

    if(this.state.isInline &&
       ((nextProps.component.open && nextProps.component.selected) ||
        JSON.stringify(this.state.component) != JSON.stringify(nextProps.component))) // TODO require state update if new component added to nested inline child
      this.setState({ component: update(nextProps.component, { open: { $set: (this.state.component != nextProps.component.open) ? nextProps.component.open : true } }) });
    else if(nextProps.component.hasOwnProperty('open') && (this.state.component.open != nextProps.component.open)) { // open/close all
      component = update(component, { open: { $set: nextProps.component.open }});
      this.setState({ component: component });
    }
  },
  componentWillMount: function() {
    console.log('component will mount');
    var comp = this.state.component;
    if(!comp.hasOwnProperty("@ComponentId") && comp.Header != undefined)
      comp = comp.CMD_Component;

    if(!comp.hasOwnProperty("@CardinalityMin")) comp = update(comp, { '@CardinalityMin': { $set: 1 } });
    if(!comp.hasOwnProperty("@CardinalityMax")) comp = update(comp, { '@CardinalityMax': { $set:  1 } });

    if(!comp.hasOwnProperty("@CardinalityMin") || !comp.hasOwnProperty("@CardinalityMax"))
      this.setState({ component: update(this.state.component, { CMD_Component: { $set: comp } }) });
  },
  componentDidMount: function() {
    console.log('component did mount');
    var self = this;
    var component = this.state.component;
    //TODO review single-object to array mappings
    if(component.CMD_Element != undefined && !$.isArray(component.CMD_Element)) {
      component.CMD_Element = [component.CMD_Element];
      //component = update(component, { CMD_Element: { $set: [component.CMD_Element] } });
    }

    if(component.CMD_Component != undefined && !$.isArray(component.CMD_Component)) {
      if(component.Header == undefined)
        component.CMD_Component = [component.CMD_Component];
        //component = update(component, { CMD_Component: { $set: [component.CMD_Component] } });
      else if(component.CMD_Component.CMD_Element != undefined && !$.isArray(component.CMD_Component.CMD_Element))
        component.CMD_Component.CMD_Element = [component.CMD_Component.CMD_Element];
        //component = update(component, { CMD_Component: { CMD_Element: { $set: [component.CMD_Component.CMD_Element] } }});
    }

    if(component.AttributeList != undefined && !$.isArray(component.AttributeList.Attribute)) {
      component = update(component, { AttributeList: { Attribute: { $set: [component.AttributeList.Attribute]} }});
    } else if($.isArray(component.AttributeList))
      component = update(component, { AttributeList: { Attribute: { $set: component.AttributeList } }});

    if(!component.hasOwnProperty("@ComponentId") && component.inlineId != undefined)
        this.setState({ isInline: true, component: update(component, { open: { $set: true }}) }, function() {
          self.props.onInlineUpdate(component);
        });
    else
      this.setState({ component: component });

    console.log('mounted component: ' + JSON.stringify(component));
  },
  componentDidUpdate: function(prevProps, prevState) {
    console.log('component did update: ', (this.state.isInline) ? this.state.component.inlineId : this.state.component['@ComponentId']);
    var self = this;
    if(!this.state.isInline && this.state.componentName == null && this.state.component.Header == undefined)
      this.props.viewer.getItemName(this.state.component['@ComponentId'], function(name) {
        self.setState({ component: update(self.state.component, { $merge: { "@name": name } }), componentName: name }, function() {
          if(self.props.updateParent != undefined) self.props.updateParent(self.state.component);
        });
      });
    else if(this.state.editMode && this.state.isInline && this.state.component.open)
      if(JSON.stringify(this.state.component) != JSON.stringify(prevState.component))
        this.props.onInlineUpdate(this.state.component);
  },
  render: function () {
    //console.log('comp inspect: ' + require('util').inspect(this.state.component, { showHidden: true, depth: null}));
    var self = this;
    var comp = this.state.component;
    var actionButtons = this.getActionButtons();

    var compId;
    if(comp.hasOwnProperty("@ComponentId"))
      compId = comp["@ComponentId"];
    else if(comp.Header != undefined)
      compId = comp.Header.ID;
    else
      compId = null;

    console.log('comp render: ', (compId != null) ? compId : 'inline');

    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name']; // TODO: use @name attr only

    if(header != undefined && comp.CMD_Component != undefined)
      comp = comp.CMD_Component;

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    console.log('comp header: ', (header != undefined) ? JSON.stringify(header) : 'none');
    console.log('open: ', (this.state.component.open != undefined) ? this.state.component.open : 'false');

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);
    var compElems = comp.CMD_Element;

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    if(compElems != undefined)
      compElems = compElems.map(function(elem, index) {
        console.log('found elem (' + index + '): ' + elem);
        var elemId = (elem.elemId != undefined) ? elem.elemId : "comp_elem_" + md5.hash("comp_elem_" + elem['@name'] + "_" + index + "_" + Math.floor(Math.random()*1000));
        elem.elemId = elemId;
        return <CMDElement key={elemId} elem={elem} viewer={self.props.viewer} editMode={self.state.editMode} onUpdate={self.updateElement.bind(self, index)} onRemove={self.removeElement.bind(self, index)} moveUp={self.moveElement.bind(self, index, index-1)} moveDown={self.moveElement.bind(self, index, index+1)} />
      });

    if(!this.state.component.open && (compId != null && !comp.hasOwnProperty('@name') && this.state.componentName != null))
       compName = this.state.componentName;
    else if(comp.hasOwnProperty("@name"))
      compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined)
      compComps = compComps.map(function(nestedComp, ncindex) {
        console.log('found component (' + ncindex + '): ' + nestedComp);

        var compId;
        if(nestedComp.hasOwnProperty("@ComponentId")) compId = nestedComp['@ComponentId'];
        else if(nestedComp.Header != undefined) compId = nestedComp.Header.ID;
        else compId = (nestedComp.inlineId != undefined) ? nestedComp.inlineId : "inline_" + md5.hash("inline_" + nestedComp['@name'] + "_" + ncindex + "_" + Math.floor(Math.random()*1000));

        var newNestedComp = nestedComp;
        if(compId.startsWith("inline") && nestedComp.inlineId == undefined)
          newNestedComp = update(newNestedComp, { $merge: { inlineId: compId } });

        console.log('compId: ' + compId);

        return <CMDComponent key={compId} parent={self.state.component} component={newNestedComp} viewer={self.props.viewer} editMode={self.state.editMode} updateParent={self.updateParent.bind(self, ncindex)} onInlineUpdate={self.updateInlineComponent.bind(self, ncindex)} onUpdate={self.updateComponentSettings.bind(self, ncindex)} onRemove={self.removeComponent.bind(self, ncindex)} moveUp={self.moveComponent.bind(self, ncindex, ncindex-1)} moveDown={self.moveComponent.bind(self, ncindex, ncindex+1)} />
      });

    // classNames
    var viewClasses = classNames('componentBody', { 'hide': !this.state.component.open });
    var editClasses = classNames('componentBody', { 'hide-field': !this.state.component.open && this.state.editMode });
    var componentClasses = classNames('CMDComponent', { 'edit-mode': this.state.editMode, 'open': this.state.component.open, 'selected': this.state.isSelected });

    var attrSet = (comp.AttributeList != undefined && $.isArray(comp.AttributeList.Attribute)) ? comp.AttributeList.Attribute : comp.AttributeList;
    var addAttrLink = (this.state.editMode) ? <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute}>+Attribute</a></div> : null;
    var selectionLink = (this.state.isInline) ? <div className="controlLinks"><a onClick={this.toggleSelection}>{(this.state.isSelected) ? "unselect" : "select"}</a></div> : null;
    var attrList = (
      <div className="attrList">AttributeList:
        {
          (attrSet != undefined && attrSet.length > 0)
          ? $.map(attrSet, function(attr, index) {
            var attrId = (attr.attrId != undefined) ? attr.attrId : "comp_attr_" + md5.hash("comp_attr_" + index + "_" + Math.floor(Math.random()*1000));
            attr.attrId = attrId;
            return (
              <CMDAttribute key={attrId} attr={attr} value={self.props.viewer.getValueScheme.bind(self.props.viewer, attr, self)} conceptRegistryBtn={self.props.viewer.conceptRegistryBtn.bind(self.props.viewer, self)} editMode={self.state.editMode} onUpdate={self.updateAttribute.bind(self, index)} onRemove={self.removeAttribute.bind(self, index)} />
            );
          })
          : <span>No Attributes</span>
        }
        {addAttrLink}
      </div>
    );

    if(this.state.editMode) {
      var cardOpt = null;
      var minComponentLink = null;
      var maxComponentLink = null;

      if(this.state.component.open) {
        minComponentLink = (this.state.component.Header != undefined && comp.hasOwnProperty("@CardinalityMin")) ? this.linkState('component.CMD_Component.@CardinalityMin') : this.linkState('component.@CardinalityMin');
        maxComponentLink = (this.state.component.Header != undefined && comp.hasOwnProperty("@CardinalityMax")) ? this.linkState('component.CMD_Component.@CardinalityMax') : this.linkState('component.@CardinalityMax');
      } else {
          cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );
      }

      var componentProps = null;
      if(compId == null) {
        var nameLink = this.linkState('component.@name');

        //inline component props
        componentProps = (
          <div>
            <Input type="text" label="Name" defaultValue={this.state.component['@name']} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, nameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            <Input ref="conceptRegInput" type="text" label="ConceptLink" value={(this.state.component['@ConceptLink']) ? this.state.component['@ConceptLink'] : ""} buttonAfter={this.props.viewer.conceptRegistryBtn(this)} labelClassName="col-xs-1" wrapperClassName="col-xs-3" onChange={this.updateConceptLink} readOnly />
          </div>
        );
        //TODO move common viewer bind methods to mixin
      }

      var handleOccMinChange = function(e) {
          console.log('comp change: ' + e.target);
          if(minComponentLink != null) {
            minComponentLink.requestChange(e.target.value);

            if(self.props.onUpdate)
              self.props.onUpdate(e.target.value, null);
          }
      };

      var handleOccMaxChange = function(e) {
        console.log('comp change: ' + e.target);
        if(maxComponentLink != null) {
          maxComponentLink.requestChange(e.target.value);

          if(self.props.onUpdate)
            self.props.onUpdate(null, e.target.value);
        }
      };

      var cmdInlineBody = (this.state.isInline) ?
        (
          <div className="inline-body">
            {attrList}
            <div className="childElements">{compElems}
              <div className="addElement"><a onClick={this.addNewElement}>+Element</a></div>
            </div>
            <div ref="components" className="childComponents">{compComps}
              <div className="addComponent"><a onClick={this.addNewComponent}>+Component</a></div>
            </div>
          </div>
        ): null;

      return (
        <div className={componentClasses}>
          {actionButtons} {selectionLink}
          <span>ComponentId: <a className="componentLink" onClick={this.toggleComponent}>{compName}</a></span> {cardOpt}
          <div className={editClasses}>
            <form className="form-horizontal form-group" name={(this.state.isInline) ? "componentForm_inline" : "componentForm_" + compId}>
              {componentProps}
              <Input type="select" label="Min Occurrences" defaultValue={minC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMinChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option key={index} value={index}>{index}</option>
                })}
              </Input>
              <Input type="select" label="Max Occurrences" defaultValue={maxC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMaxChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option key={index} value={index}>{index}</option>
                })}
              </Input>
            </form>
            {cmdInlineBody}
          </div>
        </div>
      );
    } else {
      return (
        <div className={componentClasses}>
          <span>Component: </span><a className="componentLink" onClick={this.toggleComponent}>{compName}</a>
          <div className="componentProps">{compProps}</div>
          <div className={viewClasses}>
            {attrList}
            <div className="childElements">{compElems}</div>
            <div ref="components" className="childComponents">{compComps}</div>
          </div>
        </div>
      );
    }
  }
});

module.exports = CMDComponent;
