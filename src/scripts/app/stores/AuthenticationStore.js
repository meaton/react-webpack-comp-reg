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

  handleLoginState: function(newState) {
    if(newState.uid != undefined && newState.uid != null) {
      // uid set -> user authenticated
      this.authState = {
        authenticated: true,
        uid: newState.uid,
        displayName: newState.displayName
      };
    } else {
      // uid not set -> user not authenticated
      this.authState = {
        authenticated: false
      };
    }

    this.lastChecked = Date.now();
    this.emit("change");
  }

});

module.exports = AuthenticationStore;
