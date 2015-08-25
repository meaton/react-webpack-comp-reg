var Constants = require("./constants"),
    ComponentRegistryClient = require("./service/ComponentRegistryMockClient")

module.exports = {
  loadItems: function() {
    this.dispatch(Constants.LOAD_ITEMS);
    ComponentRegistryClient.loadComponents(function(items){
        // success
        this.dispatch(Constants.LOAD_ITEMS_SUCCESS, items);
      }.bind(this),
      function(message) {
        this.dispatch(Constants.LOAD_ITEMS_FAILURE, message);
      }.bind(this)
    );
  },

  editItem: function(item) {
    this.dispatch(Constants.EDIT_ITEM);
  }
};
