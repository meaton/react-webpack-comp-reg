var log = require("loglevel");

var Constants = require("../constants");

/**
 * Authentication action
 */
module.exports = {

  login: function() {
    var uid = "uid"; //TODO
    var displayName = "name"; //TODO
    this.dispatch(Constants.LOGIN_SUCCESS, {uid: uid, displayName: displayName});
  },

  checkAuthState: function() {
    log.trace("Checking authentication state...");
    var uid = "uid"; //TODO
    var displayName = "name"; //TODO
    this.dispatch(Constants.CHECK_AUTH_STATE, {uid: uid, displayName: displayName});
  }

};
