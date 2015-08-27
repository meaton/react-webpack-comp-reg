var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var BrowserSelectionStore = Fluxxor.createStore({
  initialize: function(options) {
    this.selected = [];
    this.allowMultiple = false;

    this.bindActions(
      Constants.SELECT_BROWSER_ITEM, this.handleSelectItem,
      Constants.UNSELECT_BROWSER_ITEM, this.handleUnselectItem,
      Constants.SWITCH_MULTIPLE_SELECT, this.handleSwitchMultipleSelect
    );
  },

  getState: function() {
    return {
      selected: this.selected,
      allowMultiple: this.allowMultiple
    };
  },

  handleSelectItem: function(item) {
    //TODO
    this.emit("change");
  },

  handleUnselectItem: function(item) {
    //TODO
    this.emit("change");
  },

  handleSwitchMultipleSelect: function() {
    this.allowMultiple = !this.allowMultiple;
    //TODO: remove selection if !allow?
    this.emit("change");
  }
});

module.exports = BrowserSelectionStore;
