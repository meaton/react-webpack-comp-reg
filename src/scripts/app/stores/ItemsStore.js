var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ItemsStore = Fluxxor.createStore({
  initialize: function(options) {
    // this.current = options.current || 0;
    // this.count = options.count || 0;

    this.items = [];
    this.loading = false;
    this.errorMessage = null;

    this.bindActions(
      Constants.LOAD_ITEMS, this.handleLoadItems,
      Constants.LOAD_ITEMS_SUCCESS, this.handleLoadItemsSuccess,
      Constants.LOAD_ITEMS_FAILURE, this.handleLoadItemsFailure
    );
  },

  getState: function() {
    return {
      items: this.items,
      loading: this.loading,
      errorMessage: this.errorMessage
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
  }

});

module.exports = ItemsStore;
