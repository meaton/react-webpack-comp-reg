var Constants = require("../constants");

module.exports = {

  toggleItemExpansion: function(parentState, itemId) {
    this.dispatch(Constants.TOGGLE_ITEM_EXPANSION, parentState, itemId);
  }

};
