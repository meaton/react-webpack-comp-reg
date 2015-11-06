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

  /* Methods that handle changes (in this component and its children) */
  updateConceptLink: function(val) {
    this.propagateValue("@ConceptLink", val);
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
  }
}

module.exports = SpecFormUpdateMixin;
