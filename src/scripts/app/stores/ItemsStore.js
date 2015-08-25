var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ItemsStore = Fluxxor.createStore({
  initialize: function(options) {
    // this.current = options.current || 0;
    // this.count = options.count || 0;

    this.items = [
      {
        id: 0,
        name: "Not loaded"
      }
    ];
    this.loading = false;

    this.bindActions(
      Constants.LOAD_ITEMS, this.handleLoadItems,
      Constants.LOAD_ITEMS_SUCCESS, this.handleLoadItemsSuccess
    );
  },

  getState: function() {
    return {
      items: this.items
    };
  },

  handleLoadItems: function() {
    this.loading = true;
    this.emit("change");
  },

  handleLoadItemsSuccess: function(items) {
    this.items = items;
    this.loading = false;
    this.emit("change");
  }

});

module.exports = ItemsStore;
