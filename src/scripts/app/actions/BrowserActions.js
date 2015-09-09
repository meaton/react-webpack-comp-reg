var Constants = require("../constants");

module.exports = {

  selectBrowserItem: function(item) {
    this.dispatch(Constants.SELECT_BROWSER_ITEM, item);
  },

  switchMultipleSelect: function() {
    this.dispatch(Constants.SWITCH_MULTIPLE_SELECT);
  },

  editItem: function(item) {
    this.dispatch(Constants.EDIT_ITEM);
  }

};
