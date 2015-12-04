'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ImmutabilityUtil = require('../service/ImmutabilityUtil');
var ComponentSpec = require('../service/ComponentSpec');

var remove = ImmutabilityUtil.remove,
    update = ImmutabilityUtil.update;

var ItemsStore = Fluxxor.createStore({
  initialize: function(options) {
      this.items = [], //items to be shown in browser
      this.filteredItems = [],
      this.removed = {}, //items that have been deleted or are being deleted
      this.loading = false, //loading state
      this.type = Constants.TYPE_PROFILE, //components or profiles
      this.space = Constants.SPACE_PUBLISHED, //private, group, published
      this.group = null;
      this.filterText = null

    this.bindActions(
      Constants.LOAD_ITEMS, this.handleLoadItems,
      Constants.LOAD_ITEMS_SUCCESS, this.handleLoadItemsSuccess,
      Constants.LOAD_ITEMS_FAILURE, this.handleLoadItemsFailure,
      Constants.SWITCH_SPACE, this.handleSwitchSpace,
      Constants.DELETE_COMPONENTS, this.handleDeleteOrMove,
      Constants.DELETE_COMPONENTS_SUCCESS, this.handleDeleteOrMoveSuccess,
      Constants.DELETE_COMPONENTS_FAILURE, this.handleDeleteOrMoveFailure,
      Constants.MOVE_TO_GROUP, this.handleDeleteOrMove,
      Constants.MOVE_TO_GROUP_SUCCESS, this.handleDeleteOrMoveSuccess,
      Constants.MOVE_TO_GROUP_FAILURE, this.handleDeleteOrMoveFailure,
      Constants.FILTER_TEXT_CHANGE, this.handleFilterTextChange,
      Constants.SAVE_COMPONENT_SPEC_SUCCESS, this.handleComponentSaved
    );
  },

  getState: function() {
    return {
      items: this.filteredItems,
      deleted: this.removed,
      loading: this.loading,
      type: this.type,
      space: this.space,
      group: this.group,
      filterText: this.filterText
    };
  },

  handleLoadItems: function() {
    this.loading = true;
    this.emit("change");
  },

  handleLoadItemsSuccess: function(items) {
    this.items = items;
    this.filteredItems = filter(this.items, this.filterText);
    this.loading = false;
    this.removed = {};
    this.emit("change");
  },

  handleLoadItemsFailure: function() {
    this.loading = false;
    this.emit("change");
  },

  handleSwitchSpace: function(spaceType) {
    this.type = spaceType.type;
    this.space = spaceType.space;
    this.group = spaceType.group;
    this.emit("change");
  },

  handleDeleteOrMove: function(ids) {
    this.loading = true;
    for(var i=0; i<ids.length; i++) {
      var id=ids[i];
      this.removed = update(this.removed, {[id]: {$set: Constants.DELETE_STATE_DELETING}});
    }
    this.emit("change");
  },

  handleDeleteOrMoveSuccess: function(ids) {
    this.loading = false;
    for(var i=0; i<ids.length; i++) {
      var id=ids[i];
      this.removed = update(this.removed, {[id]: {$set: Constants.DELETE_STATE_DELETED}});
    }
    this.emit("change");
  },

  handleDeleteOrMoveFailure: function(result) {
    this.loading = false;
    // remove items from list of deleted items
    this.removed = remove(this.removed, result.ids);
    this.emit("change");
  },

  handleFilterTextChange: function(text) {
    var oldFilter = this.filterText;
    this.filterText = (text === "") ? null : text;

    if(this.filterText != null && oldFilter != null && this.filterText.indexOf(oldFilter) == 0) {
      //narrow down on existing filtered items
      this.filteredItems = filter(this.filteredItems, this.filterText);
    } else {
      //filter on full set
      this.filteredItems = filter(this.items, this.filterText);
    }
    this.emit("change");
  },

  handleComponentSaved: function(result) {
    if(result.publish) {
      //switch to public space
      this.space = Constants.SPACE_PUBLISHED;
    } else if(!result.update) {
      //new item, saved to private space
      this.space = Constants.SPACE_PRIVATE;
    }
    this.type = result.type;
    this.emit("change");
  }

});

function filter(items, filter) {
  if(filter == null) {
    return items;
  } else {
    var regex = new RegExp(escapeRegExp(filter), "i");
    return items.filter(function(item) {
      return regex.test(item.name)
      || regex.test(item.groupName)
      || regex.test(item.description)
      || regex.test(item.creatorName)
      || regex.test(item.id);
    });
  }
}

module.exports = ItemsStore;

function escapeRegExp(str) {
  //http://stackoverflow.com/a/6969486
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
