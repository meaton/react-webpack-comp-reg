'use strict';

// React
var React = require('react/addons');

// Config
var adminUrl = require('../../config').adminUrl;

// Mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* AuthState - shows login state and options to perform related actions
* @constructor
*/
var AuthState = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    authState: React.PropTypes.object.isRequired,
    onLogin: React.PropTypes.func.isRequired
  },

  render: function () {
    var authState = this.props.authState;

    if(authState.authenticated) {
      return (
        <div className="auth-logged-in">
          {authState.displayName} <a href={adminUrl + "/userSettings"} target="_blank">settings</a>
        </div>
      );
    } else {
      return (
        <a onClick={this.props.onLogin}>login</a>
      );
    }
  }
});

module.exports = AuthState;
