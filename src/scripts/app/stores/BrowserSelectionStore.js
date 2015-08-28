var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var BrowserSelectionStore = Fluxxor.createStore({
  initialize: function(options) {
    this.selectedItems = {};
    this.allowMultiple = false;

    this.bindActions(
      Constants.SELECT_BROWSER_ITEM, this.handleSelectItem,
      Constants.SWITCH_MULTIPLE_SELECT, this.handleSwitchMultipleSelect
    );
  },

  getState: function() {
    return {
      selectedItems: this.selectedItems,
      allowMultiple: this.allowMultiple
    };
  },

  handleSelectItem: function(itemId) {
    if(this.allowMultiple) {
      // we may already have a selection, check if we want to unselect
      if(this.selectedItems[itemId]) {
          //special case: unselect
          delete this.selectedItems[itemId];
          this.emit("change");
          return
      }
    } else {
      // only one item can be selected, erase existing selection
      this.selectedItems = {};
    }

    // select identified item
    this.selectedItems[itemId] = true;
    this.emit("change");
  },

  handleSwitchMultipleSelect: function() {
    this.allowMultiple = !this.allowMultiple;
    this.emit("change");
  }
});

module.exports = BrowserSelectionStore;
