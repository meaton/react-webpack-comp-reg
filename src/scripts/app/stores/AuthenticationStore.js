var log = require("loglevel");

var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    React = require('react/addons');

var update = React.addons.update;

var AuthenticationStore = Fluxxor.createStore({
  initialize: function(options) {
    this.authState = {authenticated: false};
    this.lastChecked = null;

    this.bindActions(
      Constants.LOGIN_SUCCESS, this.handleLoginState,
      Constants.CHECK_AUTH_STATE, this.handleLoginState
    );
  },

  getState: function() {
    return {
      authState: this.authState,
      lastChecked: this.lastChecked
    };
  },

  handleLoginState: function(newValues) {
    var newState;
    if(newValues.uid != undefined && newValues.uid != null) {
      // uid set -> user authenticated
      newState = {
        authenticated: true,
        uid: newValues.uid,
        displayName: newValues.displayName,
        isAdmin: newValues.isAdmin
      };
    } else {
      // uid not set -> user not authenticated
      newState = {
        authenticated: false,
        isAdmin: false
      };
    }

    this.lastChecked = Date.now();

    if(JSON.stringify(this.authState) !== JSON.stringify(newState)) {
      log.info("Authentication state changed to", newState);

      this.authState = newState;
      this.emit("change");
    }
  }

});

module.exports = AuthenticationStore;
