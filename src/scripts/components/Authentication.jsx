'use strict';

var React = require('react');
var Router = require('react-router');

var Config = require('../config');

var Login = React.createClass({
  mixins: [ Router.Navigation ],
  statics: {
    sessionExists: false,
    attemptedTransition: null,
    authUrl: "http://localhost:8080/ComponentRegistry/rest/authentication"
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

var Logout = React.createClass({
  componentDidMount: function () {
    auth.logout();
  },
  render: function () {
    return ( <div className="auth"><span className="message">You are now logged out</span></div> );
  }
});

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
    return $.ajax({
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
          authenticated: result.authenticated === 'true',
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
