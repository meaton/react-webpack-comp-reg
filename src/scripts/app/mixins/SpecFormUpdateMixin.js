'use strict';

var log = require('loglevel');


/**
* SpecFormUpdateMixin - Common functions and properties for the specification
* form components for updating properties and children
*
* Add to your component:
* - propagateValue: function(field, value)
*
* @mixin
*/
var SpecFormUpdateMixin = {

  generateAppIdForNew: function(parentId, childArray) {
    var index = (childArray == null ? 0 : childArray.length);
    return parentId + "/new_" + index;
  },

  /* Methods that handle changes (in this component and its children) */
  updateConceptLink: function(val) {
    this.propagateValue("@ConceptLink", val);
  },

  addNewAttribute: function(evt) {
    //TODO
  },

  addNewAttributeFromComponent: function(evt) {
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

  addNewAttributeFromElement: function(evt) {
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format

    var elem = this.state.elem;
    var attrList = (elem.AttributeList != undefined && $.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
    if(attrList != undefined && !$.isArray(attrList))
      attrList = [attrList];

    console.log('attrList: ' + attrList);
    var elem = (attrList == undefined) ?
      update(elem, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
      update(elem, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    console.log('new item after attr add: ' + JSON.stringify(elem));
    if(this.state.elem != null)
      this.setState({ elem: elem });
  },

  updateValueScheme: function(val) {
    log.debug("Value scheme", val);

    var type = null;
    var valScheme = null;

    if(val.type != undefined) {
      type = val.type;
    }

    if(val.pattern != undefined) {
      valScheme = {
        pattern: val.pattern
      }
    }

    if(val.enumeration != undefined) {
      valScheme = {
        enumeration: val.enumeration
      }
    }

    log.debug("Update", {['@ValueScheme']: type, ValueScheme: valScheme});

    this.props.onElementChange({$merge: {
      ['@ValueScheme']: type,
      ValueScheme: valScheme
    }});
  }
}

module.exports = SpecFormUpdateMixin;
