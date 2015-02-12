/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Router = require('react-router');
var Config = require('../config.js');

var Login = React.createClass({
  mixins: [ Router.Navigation ],
  statics: {
    attemptedTransition: null
  },
  getInitialState: function () {
    return {
      error: false
    };
  },
  handleSubmit: function (event) {
    event.preventDefault();
    auth.login("http://localhost:8080/ComponentRegistry/", function (loggedIn) {
      if (!loggedIn)
        return this.setState({ error: true });

      if (Login.attemptedTransition) {
        var transition = Login.attemptedTransition;
        Login.attemptedTransition = null;
        transition.retry();
      } else {
        this.replaceWith('/');
      }
    }.bind(this));
  },

  render: function () {
    var errors = this.state.error ? <p>Error!</p> : '';
    return (
      <form onSubmit={this.handleSubmit}>
        <button type="submit">login</button>
        {errors}
      </form>
    );
  }
});

var Logout = React.createClass({
  componentDidMount: function () {
    auth.logout();
  },
  render: function () {
    return <p>You are now logged out</p>;
  }
});

var Authentication = {
  statics: {
    willTransitionTo: function (transition) {
      if (!auth.loggedIn()) {
        Login.attemptedTransition = transition;
        transition.redirect('login');
      }
    }
  }
};

var auth = {
  login: function (targetURL, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token) {
      if (cb) cb(true);
      this.onChange(true);
      return;
    }
    shibLoginRequest(targetURL, function (res) {
      if (res.authenticated) {
        localStorage.token = res.token;
        if (cb) cb(true);
        this.onChange(true);
      } else {
        if (cb) cb(false);
        this.onChange(false);
      }
    }.bind(this));
  },

  getToken: function () {
    return localStorage.token;
  },

  logout: function (cb) {
    delete localStorage.token;
    if (cb) cb();
    this.onChange(false);
  },

  loggedIn: function () {
    return !!localStorage.token;
  },

  onChange: function () {}
};

var shibLoginRequest = function(targetURL, cb) {
  if (targetURL != null) {
    $.ajax({
      url: targetURL,
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      success: function (){
        cb({
          authenticated: true,
          token: Math.random().toString(36).substring(7),
        });
      },
      error: function() {
        cb({authenticated: false});
      }
    });
  } else {
    cb({authenticated: false});
  }
}

module.exports = {
  auth: auth,
  Login: Login,
  Logout: Logout,
  Authentication: Authentication
};
