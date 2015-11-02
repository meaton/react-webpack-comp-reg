var log = require("loglevel");
var Constants = require("../constants");

var React = require('react/addons');
var update = React.addons.update;

var ComponentRegistryClient = require("../service/ComponentRegistryClient");

/**
 * Browser actions
 */
module.exports = {

  openEditor: function(type, space, id) {
    this.dispatch(Constants.OPEN_EDITOR, {type: type, space: space, id: id});
  },

  setType: function(spec, type) {
    log.trace("setType", spec, type);

    var isProfile = (type === Constants.TYPE_PROFILE) ? "true":"false";

    //create updated spec with modified isProfile attribute
    var newSpec = update(spec, {['@isProfile']: {$set: isProfile}});
    this.dispatch(Constants.COMPONENT_SPEC_UPDATED, newSpec);
  },

  updateHeader: function(spec, change) {
    log.trace("updateHeader", spec, "change:", change);

    //create updated spec, merging existing header with changes
    var newSpec = update(spec, {Header: {$merge: change}});
    this.dispatch(Constants.COMPONENT_SPEC_UPDATED, newSpec);

    //TODO: in case of fields Name and Description, also update item..
    //in case of Name, also update 'name' attribute of root component
  },

  updateItem: function(item, change) {
    log.trace("updateItem", item, "change:", change);

    //create updated spec, merging existing header with changes
    var newSpec = update(item, {$merge: change});
    this.dispatch(Constants.ITEM_UPDATED, newSpec);
  },

  updateSpec: function(spec, change) {
    var newSpec = update(spec, change);
    this.dispatch(Constants.COMPONENT_SPEC_UPDATED, newSpec);
  }

};
