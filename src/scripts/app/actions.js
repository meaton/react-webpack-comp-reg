var Constants = require("./constants"),
    /* mock */
    // ComponentRegistryClient = require("./service/ComponentRegistryMockClient")
    /* REST client */
    ComponentRegistryClient = require("./service/ComponentRegistryClient")

module.exports = {
  loadItems: function(type, space) {
    this.dispatch(Constants.LOAD_ITEMS);
    ComponentRegistryClient.loadComponents(type, space, function(items){
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
