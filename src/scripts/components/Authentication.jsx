'use strict';

var React = require('react');
var Router = require('react-router');

var Config = require('../config').Config;
var restUrl = require('../config').restUrl;

/**
* Login - redirects to the REST Auth service. The form submit event occurs after component is mounted.
* @constructor
* @mixes Router.Navigation
*/
var Login = React.createClass({
  mixins: [ Router.Navigation ],
  statics: {
    sessionExists: false,
    attemptedTransition: null,
    authUrl: restUrl + "/authentication"
  },
  getInitialState: function () {
    return {
      error: false
    };
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
  componentDidMount: function() {
    this.refs.submitForm.getDOMNode().submit();
  },
  render: function () {
    var errors = this.state.error ? <p>Error!</p> : '';
    //TODO check for last attemptedTransition (path), use in redirect
    var postForm =
      (<form ref="submitForm" action={ Login.authUrl + "?redirect=" + "http://" + window.location.host + "/" } method="POST" className="hide">
        <button type="button" onClick={this.checkLogin}>check status</button><br/>
        <button type="submit">login</button>
        {errors}
      </form>);
    return (
      <div className="auth">
        <span className="message">Redirecting to login...</span>
        {postForm}
      </div>
    );
  }
});

/**
* Logout - a test component for changing the authenticated/session state of the application.
* @constructor
*/
var Logout = React.createClass({
  componentDidMount: function () {
    auth.logout();
  },
  render: function () {
    return ( <div className="auth"><span className="message">You are now logged out</span></div> );
  }
});

/**
* Authentication - mixin implements static functions for react-router transition hooks, for checking the authentication state of the application before transitioning to the new route.
* Currently used as a mixin to ComponentEditor and Import (Main).
* @mixin
*/
var Authentication = {
  statics: {
    willTransitionTo: function (transition, params, query, callback) {
      if(!Login.sessionExists) {
        auth.login().then(function(data) {
          if(data.authenticated === 'false') {
            Login.attemptedTransition = transition;
            transition.redirect('login');
          } else {
            Login.sessionExists = true;
            transition.retry();
          }
        }).then(callback);
      } else callback();
    }
  }
};

/* Login/logout handler */
var auth = {
  login: function (cb) {
    cb = arguments[arguments.length - 1];

    /*
    if (localStorage.token && localStorage.displayName) {
      if (cb) cb(true);
      this.onChange(true, localStorage.displayName);
      return;
    }
    */

    return loginRequest(function (res) {
      console.log('auth:' + res.authenticated);
      if (res.authenticated) {
        //localStorage.token = res.token;
        //localStorage.displayName = res.displayName;
        if (cb) cb(true);
        Login.sessionExists = true;
        this.onChange(true, res.displayName);
      } else {
        if (cb) cb(false);
        Login.sessionExists = false;
        this.onChange(false);
      }

    }.bind(this));
  },
  /*getDisplayName: function() {
    return localStorage.displayName;
  },
  getToken: function () {
    return localStorage.token;
  },*/
  logout: function (cb) {
    delete localStorage.displayName;
    delete localStorage.token;

    if (cb) cb();
    Login.sessionExists = false;
    this.onChange(false);
  }
};

var loginRequest = function(cb) {
  var corsRequestParams = (Config.cors) ?
    { username: Config.REST.auth.username,
      password: Config.REST.auth.password,
      xhrFields: {
        withCredentials: true
    }} : {};
  return $.ajax($.extend({
    url: Login.authUrl,
    type: 'GET',
    dataType: 'json',
    success: function (result){
      console.log('result: ' + result);
      cb({
        authenticated: result.authenticated === 'true',
        token: Math.random().toString(36).substring(7),
        displayName: result.displayName
      });
    },
    error: function() {
      cb({authenticated: false});
    }
  }, corsRequestParams));
}

/** @module Authentication handler */
module.exports = {
  auth: auth,
  Login: Login,
  Logout: Logout,
  Authentication: Authentication
};
