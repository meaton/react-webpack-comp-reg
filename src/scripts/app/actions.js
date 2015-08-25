var Constants = require("./constants");

module.exports = {
  loadItems: function() {
    this.dispatch(Constants.LOAD_ITEMS);
    // do load
    this.dispatch(Constants.LOAD_ITEMS_SUCCESS,
    [
      {
        id: 1,
        name: "First item"
      },
      {
        id: 2,
        name: "Second item"
      }
    ]);
  },

  editItem: function(item) {
    this.dispatch(Constants.EDIT_ITEM);
  }
};
