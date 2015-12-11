'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ImmutabilityUtil = require('../util/ImmutabilityUtil');
var ComponentSpec = require('../service/ComponentSpec');
var ItemsFilter = require('../service/ItemsFilter');

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
      this.team = null;
      this.filterText = null,
      this.sortState = null;

    this.bindActions(
      Constants.LOAD_ITEMS, this.handleLoadItems,
      Constants.LOAD_ITEMS_SUCCESS, this.handleLoadItemsSuccess,
      Constants.LOAD_ITEMS_FAILURE, this.handleLoadItemsFailure,
      Constants.SWITCH_SPACE, this.handleSwitchSpace,
      Constants.DELETE_COMPONENTS, this.handleDeleteOrMove,
      Constants.DELETE_COMPONENTS_SUCCESS, this.handleDeleteOrMoveSuccess,
      Constants.DELETE_COMPONENTS_FAILURE, this.handleDeleteOrMoveFailure,
      Constants.MOVE_TO_TEAM, this.handleDeleteOrMove,
      Constants.MOVE_TO_TEAM_SUCCESS, this.handleDeleteOrMoveSuccess,
      Constants.MOVE_TO_TEAM_FAILURE, this.handleDeleteOrMoveFailure,
      Constants.FILTER_TEXT_CHANGE, this.handleFilterTextChange,
      Constants.SAVE_COMPONENT_SPEC_SUCCESS, this.handleComponentSaved,
      Constants.TOGGLE_SORT_STATE, this.toggleSortState
    );
  },

  getState: function() {
    return {
      items: this.filteredItems,
      deleted: this.removed,
      loading: this.loading,
      type: this.type,
      space: this.space,
      team: this.team,
      filterText: this.filterText,
      sortState: this.sortState
    };
  },

  handleLoadItems: function() {
    this.loading = true;
    this.emit("change");
  },

  handleLoadItemsSuccess: function(items) {
    this.items = items;
    this.filteredItems = ItemsFilter.filter(this.items, this.filterText, this.sortState);
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
    this.team = spaceType.team;
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
    this.filteredItems = ItemsFilter.updateItems(this.items, text, this.filteredItems, this.filterText, this.sortState);
    this.filterText = ItemsFilter.updateFilterText(text);
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
  },

  toggleSortState: function(column) {
    var currentColumn = (this.sortState != null)?this.sortState.column : null;
    var currentOrder= (this.sortState != null)?this.sortState.order : null;
    this.sortState = {
      column: (currentColumn === column && currentOrder === Constants.SORT_ORDER_DESC) ? null : column,
      order: (currentColumn === column && Constants.SORT_ORDER_ASC) ? Constants.SORT_ORDER_DESC : Constants.SORT_ORDER_ASC
    };
    if(this.sortState.column == null) {
      // refilter from items
      this.filteredItems = ItemsFilter.filter(this.items, this.filterText);
    } else {
      this.filteredItems = ItemsFilter.updateItems(this.items, this.filterText, this.filteredItems, this.filterText, this.sortState);
    }
    this.emit("change");
  }

});

module.exports = ItemsStore;
