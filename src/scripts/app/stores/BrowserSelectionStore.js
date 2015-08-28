var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var BrowserSelectionStore = Fluxxor.createStore({
  initialize: function(options) {
    this.selectedItems = {};
    this.allowMultiple = false;

    this.bindActions(
      Constants.SELECT_BROWSER_ITEM, this.handleSelectItem,
      //Constants.UNSELECT_BROWSER_ITEM, this.handleUnselectItem,
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
    if(this.selectedItems[itemId]) {
      // unselect
      delete this.selectedItems[itemId];
    } else {
      // select
      if(!this.allowMultiple) {
        // erase existing selection
        this.selectedItems = {};
      }
      this.selectedItems[itemId] = true;
    }
    this.emit("change");
  },

  // handleUnselectItem: function(itemId) {
  //   //TODO
  //   this.emit("change");
  // },

  handleSwitchMultipleSelect: function() {
    this.allowMultiple = !this.allowMultiple;
    //TODO: remove selection if !allow?
    this.emit("change");
  }
});

module.exports = BrowserSelectionStore;
