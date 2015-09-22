var Constants = require("../constants");

module.exports = {

  selectBrowserItem: function(item) {
    this.dispatch(Constants.SELECT_BROWSER_ITEM, item);
  },

  switchMultipleSelect: function() {
    this.dispatch(Constants.SWITCH_MULTIPLE_SELECT);
  },

  switchSpace: function(type, registry) {
    this.dispatch(Constants.SWITCH_SPACE, {type: type, registry: registry});
  },

  editItem: function(item) {
    this.dispatch(Constants.EDIT_ITEM);
  }

};
