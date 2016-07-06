'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    React = require('react');

var ExpansionState = require("../service/ExpansionState");
var ItemsFilter = require('../service/ItemsFilter');

var update = require('react-addons-update');

var EditorStore = Fluxxor.createStore({
  initialize: function(options) {
    this.type = Constants.TYPE_COMPONENT; //components or profiles
    this.item = null;
    this.processing = false;
    this.componentLinkingMode = false;
    this.selectedComponentId = null; //selected for linking

    this.gridSpace = Constants.SPACE_PUBLISHED;
    this.gridTeam = null;
    this.gridItems = [];
    this.filteredGridItems = [];
    this.gridLoading = false;
    this.gridFilterText = null;

    // component spec itself is stored in the component details store for the editor

    this.bindActions(
      Constants.OPEN_EDITOR, this.handleOpenEditor,
      Constants.LOAD_ITEM, this.handleLoadItem,
      Constants.LOAD_ITEM_SUCCESS, this.handleLoadItemSuccess,
      Constants.LOAD_ITEM_FAILURE, this.handleLoadItemFailure,
      Constants.ITEM_UPDATED, this.handleLoadItemSuccess,
      Constants.SAVE_COMPONENT_SPEC, this.handleSave,
      Constants.SAVE_COMPONENT_SPEC_SUCCESS, this.handleSaveDone,
      Constants.SAVE_COMPONENT_SPEC_FAILURE, this.handleSaveDone,
      Constants.SAVE_COMPONENT_SPEC_ABORTED, this.handleSaveDone,
      Constants.LOAD_EDITOR_ITEMS, this.handleLoadGridItems,
      Constants.LOAD_EDITOR_ITEMS_SUCCESS, this.handleLoadGridItemsSuccess,
      Constants.LOAD_EDITOR_ITEMS_FAILURE, this.handleLoadGridItemsFailure,
      Constants.SWITCH_EDITOR_GRID_SPACE, this.handleSwitchGridSpace,
      Constants.GRID_FILTER_TEXT_CHANGE, this.handleFilterTextChange,
      Constants.START_COMPONENT_LINK, this.handleStartComponentLink,
      Constants.COMPLETE_COMPONENT_LINK, this.handleCompleteComponentLink
    );
  },

  getState: function() {
    // 'singleton' selectedItem associative array
    var selectedItems = {};
    if(this.selectedGridItem != null) {
      selectedItems[this.selectedGridItem.id] = this.selectedGridItem;
    }
    return {
      type: this.type,
      item: this.item,
      componentLinkingMode: this.componentLinkingMode,
      selectedComponentId: this.selectedComponentId,
      processing: this.processing,
      grid: {
        space: this.gridSpace,
        team: this.gridTeam,
        items: this.filteredGridItems,
        loading: this.gridLoading,
        filterText: this.gridFilterText
      }
    };
  },

  handleOpenEditor: function(obj) {
    this.type = obj.type;

    // reset component linking/selection state
    this.selectedComponentId = null;
    this.componentLinkingMode = false;

    // reset grid
    this.gridSpace = Constants.SPACE_PUBLISHED
    this.gridTeam = null;
    this.gridItems = [];
    this.emit("change");
  },

  handleLoadItem: function(itemId) {
    this.processing = true;
    this.emit("change");
  },

  handleLoadItemSuccess: function(item) {
    this.processing = false;
    this.item = item
    this.emit("change");
  },

  handleLoadItemFailure: function() {
    this.processing = false;
    this.item = null;
    this.emit("change");
  },

  handleSave: function() {
    this.processing = true;
    this.emit("change");
  },

  handleSaveDone: function() {
    this.processing = false;
    this.emit("change");
  },

  handleSelectGridItem: function(item) {
    this.selectedGridItem = item;
    this.emit("change");
  },

  handleSwitchGridSpace: function(spaceObj) {
    this.gridSpace = spaceObj.space;
    this.gridTeam = spaceObj.team;
    this.emit("change");
  },

  handleStartComponentLink: function(id) {
    this.selectedComponentId = id;
    this.componentLinkingMode = true;
    this.emit("change");
  },

  handleCompleteComponentLink: function() {
    this.componentLinkingMode = false;
    this.emit("change");
  },

  handleLoadGridItems: function() {
    this.gridLoading = true;
    this.emit("change");
  },

  handleLoadGridItemsFailure: function() {
    this.gridLoading = false;
    this.emit("change");
  },

  handleLoadGridItemsSuccess: function(items) {
    this.gridItems = items;
    this.filteredGridItems = ItemsFilter.filter(this.gridItems, this.gridFilterText);
    this.gridLoading = false;
    this.emit("change");
  },

  handleFilterTextChange: function(text) {
    this.filteredGridItems = ItemsFilter.updateItems(this.gridItems, text, this.filteredGridItems, this.gridFilterText);
    this.gridFilterText = ItemsFilter.updateFilterText(text);
    this.emit("change");
  }

});

module.exports = EditorStore;
