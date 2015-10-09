var log = require("loglevel");

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var SelectionStore = Fluxxor.createStore({
  initialize: function(options) {
    // application mode the store will serve information for (browser or items in grid in editor)
    this.mode = Constants.MODE_BROWSER;

    this.state = {
      [Constants.MODE_BROWSER]: {
        selectedItems: {},
        allowMultiple: false,
        currentItem: null
      },
      [Constants.MODE_EDITOR]: {
        selectedItems: {},
        allowMultiple: false,
        currentItem: null
      }
    }

    this.bindActions(
      Constants.SELECT_BROWSER_ITEM, this.handleSelectItem,
      Constants.SWITCH_MULTIPLE_SELECT, this.handleSwitchMultipleSelect,
      Constants.SWITCH_SPACE, this.handleSwitchSpace,
      Constants.DELETE_COMPONENTS_SUCCESS, this.handleDeleteItemsSuccess
    );
  },

  getState: function() {
    return this.state[this.mode];
  },

  handleSelectItem: function(item) {
    this.getState().currentItem = item;

    if(this.getState().allowMultiple) {
      // we may already have a selection, check if we want to unselect
      if(this.getState().selectedItems[item.id]) {
          //special case: unselect
          delete this.getState().selectedItems[item.id];
          this.emit("change");
          return
      }
    } else {
      // only one item can be selected, erase existing selection
      this.getState().selectedItems = {};
    }

    // select identified item
    this.getState().selectedItems[item.id] = item;
    this.emit("change");
  },

  handleSwitchMultipleSelect: function() {
    this.getState().allowMultiple = !this.getState().allowMultiple;
    this.emit("change");
  },

  handleSwitchSpace: function() {
    // remove selection on space switch
    this.getState().selectedItems = {};
    this.emit("change");
  },

  handleDeleteItemsSuccess: function(ids) {
    log.debug("Removing deleted items from selection");
    // remove deleted items from selection
    for(var i=0; i<ids.length; i++) {
      var id=ids[i];
      log.debug("Checking" ,id);
      if(this.getState().selectedItems[id]) {
        log.debug("Removing" ,id);
        delete this.getState().selectedItems[id];
      }
    }
    this.emit("change");
  }
});

module.exports = SelectionStore;
