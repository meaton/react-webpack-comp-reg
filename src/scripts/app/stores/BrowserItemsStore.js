var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var BrowserItemsStore = Fluxxor.createStore({
  initialize: function(options) {
    this.items = [];
    this.loading = false;
    this.errorMessage = null;
    this.type = Constants.TYPE_PROFILE;
    this.space = Constants.SPACE_PUBLISHED;

    this.bindActions(
      Constants.LOAD_ITEMS, this.handleLoadItems,
      Constants.LOAD_ITEMS_SUCCESS, this.handleLoadItemsSuccess,
      Constants.LOAD_ITEMS_FAILURE, this.handleLoadItemsFailure,
      Constants.SWITCH_SPACE, this.handleSwitchSpace
    );
  },

  getState: function() {
    return {
      items: this.items,
      loading: this.loading,
      errorMessage: this.errorMessage,
      type: this.type,
      space: this.space
    };
  },

  handleLoadItems: function() {
    this.errorMessage = null;
    this.loading = true;
    this.emit("change");
  },

  handleLoadItemsSuccess: function(items) {
    this.items = items;
    this.loading = false;
    this.emit("change");
  },

  handleLoadItemsFailure: function(message) {
    this.loading = false;
    this.errorMessage = message;
    this.emit("change");
  },

  handleSwitchSpace: function(space) {
    this.type = space.type;
    this.space = space.registry;
    this.emit("change");
  }

});

module.exports = BrowserItemsStore;
