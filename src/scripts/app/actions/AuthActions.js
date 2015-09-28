var log = require("loglevel");

var Constants = require("../constants");

var Constants = require("../constants"),
    ComponentRegistryClient = require("../service/ComponentRegistryClient")

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
    var authState = ComponentRegistryClient.getAuthState(function(authState){
      if(trace != null) {
        log.debug("Auth state:", authState);
        this.dispatch(Constants.CHECK_AUTH_STATE, authState);
      } else {
        this.dispatch(Constants.CHECK_AUTH_STATE, {uid: null});
      }
    }.bind(this), function(message){
      //TODO: dispatch so that store knows auth state is not up to date?
      log.error(message);
    });
  }

};
