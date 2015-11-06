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

  addNewAttribute: function(onChange, evt) {
    var spec = this.props.spec;
    var attrList = spec.AttributeList;

    var appId = this.generateAppIdForNew(spec._appId, (attrList == null) ? null : attrList.Attribute)
    var newAttrObj = { Name: "", Type: "string", _appId: appId }; //TODO check format

    var update;
    if(attrList == null) {
      // create prepopulated attrlist
      update = {$merge: {AttributeList: {Attribute: [newAttrObj]}}};
    } else {
      var attribute = attrList.Attribute;
      if(attribute == null) {
        // add first attribute wrapped in new array
        update = {AttributeList: {Attribute: {$set: [newAttrObj]}}};
      } else if($.isArray(attribute)) {
        // push new to existing array
        update = {AttributeList: {Attribute: {$push: [newAttrObj]}}};
      } else {
        // not an array, turn into array and add new
        update = {AttributeList: {Attribute: {$set: [spec.AttributeList.Attribute, newAttrObj]}}};
      }
    }
    log.debug("Update attribute:", update);
    onChange(update);
  },

  addNewAttributeFromElement: function(evt) {
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format

    var spec = this.state.spec;

    var attrList = (spec.AttributeList != undefined && $.isArray(spec.AttributeList.Attribute)) ? spec.AttributeList.Attribute : spec.AttributeList;
    if(attrList != undefined && !$.isArray(attrList))
      attrList = [attrList];

    var spec = (attrList == undefined) ?
      update(spec, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
      update(spec, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    console.log('new item after attr add: ' + JSON.stringify(spec));
    if(this.state.spec != null)
      this.setState({ spec: spec });
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
