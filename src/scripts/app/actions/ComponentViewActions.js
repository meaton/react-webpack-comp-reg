var Constants = require("../constants");

module.exports = {

  toggleItemExpansion: function(itemId) {
    this.dispatch(Constants.TOGGLE_ITEM_EXPANSION, itemId);
  }

};
