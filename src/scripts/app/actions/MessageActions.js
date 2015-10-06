var Constants = require("../constants");

/**
 * Browser actions
 */
module.exports = {

  dismissMessage: function(id) {
    this.dispatch(Constants.DISMISS_MESSAGE, id);
  }

};
