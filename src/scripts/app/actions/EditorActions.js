var log = require("loglevel");
var Constants = require("../constants");

var React = require('react/addons');
var update = React.addons.update;

var ComponentRegistryClient = require("../service/ComponentRegistryClient");
var SpecAugmenter = require("../service/SpecAugmenter");

/**
 * Browser actions
 */
var EditorActions = {

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

  updateHeader: function(spec, item, change) {
    log.trace("updateHeader", spec, "change:", change);

    //create updated spec, merging existing header with changes
    var newSpec = update(spec, {Header: {$merge: change}});

    // some fields needs to be synced with item description and root component
    var newItem;
    if(change.Name) {
      // also update name in item description and root component attribute
      newSpec = update(newSpec, {CMD_Component: {["@name"]: {$set: change.Name}}});
      newItem = update(item, {$merge: {name: change.Name}});
    } else if(change.Description) {
      // also update name in item description
      newItem = update(item, {$merge: {description: change.Description}});
    }

    this.dispatch(Constants.COMPONENT_SPEC_UPDATED, newSpec);

    if(newItem != undefined) {
      this.dispatch(Constants.ITEM_UPDATED, newItem);
    }
  },

  updateItem: function(item, change) {
    log.trace("updateItem", item, "change:", change);

    //create updated spec, merging existing header with changes
    var newItem = update(item, {$merge: change});
    this.dispatch(Constants.ITEM_UPDATED, newItem);
  },

  updateSpec: function(spec, change) {
    log.debug("Applying change", change, "to spec:", spec);
    var newSpec = update(spec, change);
    this.dispatch(Constants.COMPONENT_SPEC_UPDATED, newSpec);
  },

  newComponentSpec: function(type, space) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);

    // create blank spec
    var spec = {
      ["@isProfile"]: type === Constants.TYPE_PROFILE ? "true":"false",
      Header: {
          Name: "",
          Description: ""
      },
      CMD_Component: {
          ["@name"]: "",
          ["@CardinalityMin"]: "1",
          ["@CardinalityMax"]: "1",
          CMD_Element: [],
          CMD_Component: []
      }
    };

    // augment with ids
    SpecAugmenter.augmentWithIds(spec);
    this.dispatch(Constants.LOAD_COMPONENT_SPEC_SUCCES, {spec: spec});
  },

  newItem: function(type, space) {
    // create blank item description
    var item = {
      description: "",
      name: "",
      domainName: "",
      groupName: "",
    };
    this.dispatch(Constants.LOAD_ITEM_SUCCESS, item);
  },

  switchEditorGridSpace: function(space) {
    this.dispatch(Constants.SWITCH_EDITOR_GRID_SPACE, space);
  }

};

module.exports = EditorActions;
