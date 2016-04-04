var log = require("loglevel");
var Constants = require("../constants");

var update = require('react-addons-update');

var ComponentRegistryClient = require("../service/ComponentRegistryClient");
var SpecAugmenter = require("../service/SpecAugmenter");

var ComponentSpec = require('../service/ComponentSpec');
var updateInComponent = ComponentSpec.updateInComponent;
var generateAppIdForNew = ComponentSpec.generateAppIdForNew;

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
    var newSpec = update(spec, {'@isProfile': {$set: isProfile}});
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
      newSpec = update(newSpec, {Component: {'@name': {$set: change.Name}}});
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

  insertComponentById: function(spec, componentAppId, itemId, cb, cbFailure) {
    this.dispatch(Constants.COMPLETE_COMPONENT_LINK);
    // We want to insert a new component (by reference with itemId) in spec's
    // child component with the matching component 'appId'

    var error = null;

    // create a new specification using immutability utils...
    var newSpec = updateInComponent(spec, componentAppId, {$apply: function(comp){
      //check whether component to link is already present
      if($.isArray(comp.Component)) {
        log.debug("Checking children in", comp);
        for(var i=0;i<comp.Component.length;i++) {
          var child = comp.Component[i];
          log.debug("Child:", child);
          if(child['@ComponentId'] === itemId) {
            log.warn("Child with id",itemId,"already exists in component!");
            error = "The component is already linked from this parent. A component can only be linked once per parent component.";
            return comp; //return unchanged
          }
        }
      }

      // return a modified component that has a new component declaration...
      //
      // first we need a new unique appId
      var appId = generateAppIdForNew(comp._appId, comp.Component);
      var newComponent = {'@ComponentId': itemId, '_appId': appId};

      log.debug("New child component in", comp, ":", newComponent);

      // either add to existing Component or create a new child component array
      if($.isArray(comp.Component)) {
        // add to existing
        return update(comp, {Component: {$push: [newComponent]}});
      } else {
        // first child, create new array
        return update(comp, {Component: {$set: [newComponent]}});
      }
    }});
    if(error == null) {
      this.dispatch(Constants.COMPONENT_SPEC_UPDATED, newSpec);
      if(cb != null) {
        cb(newSpec);
      }
    } else {
      if(cbFailure != null) {
        cbFailure(error);
      }
    }
  },

  newComponentSpec: function(type, space) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);

    // create blank spec
    var spec = {
      "@isProfile": type === Constants.TYPE_PROFILE ? "true":"false",
      Header: {
          Name: "",
          Description: ""
      },
      Component: {
          "@name": "",
          "@CardinalityMin": "1",
          "@CardinalityMax": "1",
          Element: [],
          Component: []
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

  switchEditorGridSpace: function(space, team) {
    this.dispatch(Constants.SWITCH_EDITOR_GRID_SPACE, {space: space, team: team});
  },

  setGridFilterText: function(value) {
    this.dispatch(Constants.GRID_FILTER_TEXT_CHANGE, value);
  },

  startComponentLink: function(id) {
    this.dispatch(Constants.START_COMPONENT_LINK, id);
  },

  cancelComponentLink: function() {
    this.dispatch(Constants.COMPLETE_COMPONENT_LINK);
  },

  expandAll: function(spec) {
    var ids = ComponentSpec.getTreeIds(spec);
    this.dispatch(Constants.SET_ITEM_EXPANSION, {itemIds: ids, expansionState: true});
  },

  collapseAll: function(spec) {
    var ids = ComponentSpec.getTreeIds(spec);
    this.dispatch(Constants.SET_ITEM_EXPANSION, {itemIds: ids, expansionState: false});
  }

};

module.exports = EditorActions;
