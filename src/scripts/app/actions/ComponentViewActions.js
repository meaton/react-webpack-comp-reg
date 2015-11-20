var Constants = require("../constants");

module.exports = {

  toggleItemExpansion: function(itemId, defaultState) {
    this.dispatch(Constants.TOGGLE_ITEM_EXPANSION, {itemId: itemId, defaultState: defaultState});
  }

};
