var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    ExpansionState = require("../service/ExpansionState"),
    React = require('react/addons');

var log = require('loglevel');

var update = React.addons.update;

var EditorStore = Fluxxor.createStore({
  initialize: function(options) {
    this.type = Constants.TYPE_COMPONENTS; //components or profiles
    this.item = null;
    this.processing = false;
    this.selectedComponentId = null;

    this.gridSpace = Constants.SPACE_PUBLISHED;
    this.gridTeam = null;
    this.gridItems = [];
    this.gridLoading = false;

    // component spec itself is stored in the component details store for the editor

    this.bindActions(
      Constants.OPEN_EDITOR, this.handleOpenEditor,
      Constants.LOAD_ITEM_SUCCESS, this.handleLoadItem,
      Constants.LOAD_ITEM_FAILURE, this.handleLoadItemFailure,
      Constants.ITEM_UPDATED, this.handleLoadItem,
      Constants.SAVE_COMPONENT_SPEC, this.handleSave,
      Constants.SAVE_COMPONENT_SPEC_SUCCESS, this.handleSaveDone,
      Constants.SAVE_COMPONENT_SPEC_FAILURE, this.handleSaveDone,
      Constants.LOAD_EDITOR_ITEMS, this.handleLoadGridItems,
      Constants.LOAD_EDITOR_ITEMS_SUCCESS, this.handleLoadGridItemsSuccess,
      Constants.LOAD_EDITOR_ITEMS_FAILURE, this.handleLoadGridItemsFailure,
      Constants.SWITCH_EDITOR_GRID_SPACE, this.handleSwitchGridSpace,
      Constants.TOGGLE_COMPONENT_SELECTION, this.handleToggleComponentSelection
    );
  },

  getState: function() {
    // 'singleton' selectedItem associative array
    var selectedItems = (this.selectedGridItem == null) ? {} : {[this.selectedGridItem.id]: this.selectedGridItem}
    return {
      type: this.type,
      item: this.item,
      selectedComponentId: this.selectedComponentId,
      processing: this.processing,
      grid: {
        space: this.gridSpace,
        team: this.gridTeam,
        items: this.gridItems,
        loading: this.gridLoading
      }
    };
  },

  handleOpenEditor: function(obj) {
    this.type = obj.type;

    // reset component selection state
    this.selectedComponentId = null;

    this.emit("change");
  },

  handleLoadItem: function(item) {
    this.item = item
    this.emit("change");
  },

  handleLoadItemFailure: function() {
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

  handleToggleComponentSelection: function(id) {
    if(id === this.selectedComponentId) {
      log.debug("Unselected", id);
      this.selectedComponentId = null;
    } else {
      log.debug("Select", id, "instead of", this.selectedComponentId);
      this.selectedComponentId = id;
    }
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
    this.gridLoading = false;
    this.gridItems = items;
    this.emit("change");
  }

});

module.exports = EditorStore;
