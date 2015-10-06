var log = require("loglevel");

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var BrowserSelectionStore = Fluxxor.createStore({
  initialize: function(options) {
    this.selectedItems = {};
    this.allowMultiple = false;
    this.currentItem = null;

    this.bindActions(
      Constants.SELECT_BROWSER_ITEM, this.handleSelectItem,
      Constants.SWITCH_MULTIPLE_SELECT, this.handleSwitchMultipleSelect,
      Constants.SWITCH_SPACE, this.handleSwitchSpace,
      Constants.DELETE_COMPONENTS_SUCCESS, this.handleDeleteItemsSuccess
    );
  },

  getState: function() {
    return {
      selectedItems: this.selectedItems,
      allowMultiple: this.allowMultiple,
      currentItem: this.currentItem
    };
  },

  handleSelectItem: function(item) {
    this.currentItem = item;

    if(this.allowMultiple) {
      // we may already have a selection, check if we want to unselect
      if(this.selectedItems[item.id]) {
          //special case: unselect
          delete this.selectedItems[item.id];
          this.emit("change");
          return
      }
    } else {
      // only one item can be selected, erase existing selection
      this.selectedItems = {};
    }

    // select identified item
    this.selectedItems[item.id] = item;
    this.emit("change");
  },

  handleSwitchMultipleSelect: function() {
    this.allowMultiple = !this.allowMultiple;
    this.emit("change");
  },

  handleSwitchSpace: function() {
    // remove selection on space switch
    this.selectedItems = {};
    this.emit("change");
  },

  handleDeleteItemsSuccess: function(ids) {
    log.debug("Removing deleted items from selection");
    // remove deleted items from selection
    for(var i=0; i<ids.length; i++) {
      var id=ids[i];
      log.debug("Checking" ,id);
      if(this.selectedItems[id]) {
        log.debug("Removing" ,id);
        delete this.selectedItems[id];
      }
    }
    this.emit("change");
  }
});

module.exports = BrowserSelectionStore;
