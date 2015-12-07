'use strict';

// React
var React = require('react/addons');

// Config
var Config = require('../../config').Config;
var adminUrl = require('../../config').adminUrl;
var restUrl = require('../../config').restUrl;
var authUrl = restUrl + "/authentication"

// Mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* AuthState - shows login state and options to perform related actions
* @constructor
*/
var AuthState = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    authState: React.PropTypes.object.isRequired
  },

  render: function () {
    var authState = this.props.authState;

    if(authState.authenticated) {
      return (
        <div className="auth-logged-in">
          {authState.displayName}
          &nbsp;
          <a href={adminUrl + "/userSettings"} target="_blank">&nbsp;settings</a>
          &nbsp;
          {authState.isAdmin ? (
            <a href={adminUrl} target="_blank">admin</a>
          ) : null}
        </div>
      );
    } else {
      return (
        <form id="login" className="login-form" ref="submitForm" action={authUrl + "?redirect=" + window.location.protocol + "//" + window.location.host + Config.deploy.path } method="POST">
          <button type="submit">login</button>
        </form>
      );
    }
  }
});

var AuthUtil = {
  triggerLogin: function() {
    var loginForm = $("form#login");
    if(loginForm != null) {
      loginForm.submit();
      return true;
    } else {
      return false;
    }
  }
}

module.exports = {AuthState: AuthState, AuthUtil: AuthUtil};
