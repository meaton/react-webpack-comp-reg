'use strict';

var React = require('react');
var Router = require('react-router');
var Config = require('../config.js');

var Login = React.createClass({
  mixins: [ Router.Navigation ],
  statics: {
    attemptedTransition: null,
    authUrl: "http://localhost:8080/ComponentRegistry/rest/authentication"
  },
  getInitialState: function () {
    return {
      error: false
    };
  },
  handleSubmit: function(event) {
    event.target.method = "post";
    event.target.action = Login.authUrl + "?redirect=" + "http://" + window.location.host + "/";

    return true;
  },
  checkLogin: function (event) {
    auth.login(function (loggedIn) {
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
        <button type="button" onClick={this.checkLogin}>check status</button><br/>
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
  login: function (cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token && localStorage.displayName) {
      if (cb) cb(true);
      this.onChange(true, localStorage.displayName);
      return;
    }

    loginRequest(function (res) {
      console.log('auth:' + res.authenticated);
      if (res.authenticated) {
        localStorage.token = res.token;
        localStorage.displayName = res.displayName;
        if (cb) cb(true);
        this.onChange(true, res.displayName);
      } else {
        if (cb) cb(false);
        this.onChange(false);
      }
    }.bind(this));
  },
  getDisplayName: function() {
    return localStorage.displayName;
  },
  getToken: function () {
    return localStorage.token;
  },
  logout: function (cb) {
    delete localStorage.displayName;
    delete localStorage.token;
    if (cb) cb();
    this.onChange(false);
  },
  loggedIn: function () {
    return !!localStorage.token;
  },
  onChange: function () {
    console.log('login change event');
  }
};

var loginRequest = function(cb) {
    $.ajax({
      url: Login.authUrl,
      type: 'GET',
      username: Config.auth.username,
      password: Config.auth.password,
      xhrFields: {
        withCredentials: true
      },
      dataType: 'json',
      success: function (result){
        console.log('result: ' + result);
        cb({
          authenticated: result.authenticated == 'true',
          token: Math.random().toString(36).substring(7),
          displayName: result.displayName
        });
      },
      error: function() {
        cb({authenticated: false});
      }
    });
  }

module.exports = {
  auth: auth,
  Login: Login,
  Logout: Logout,
  Authentication: Authentication
};
