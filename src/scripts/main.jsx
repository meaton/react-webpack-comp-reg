'use strict';

var React = require('react');
var Router = require('react-router');
var { Route, RouteHandler, DefaultRoute, Link, NotFoundRoute } = Router;

//boostrap
var PageHeader = require('react-bootstrap/lib/PageHeader');

//components
var { auth, Login, Logout, Authentication } = require('./components/Authentication');
var ComponentRegApp = require('./components/ComponentRegApp');
var ComponentViewer = require('./components/ComponentViewer');
var ComponentEditor = require('./components/ComponentEditor');

var Config = require('./config').Config;
var adminUrl = require('./config').adminUrl;

// main stylesheets
require('../styles/main.css');
require('../styles/normalize.css');

/***
* NotFound - Display for a non-configured route
* @constructor
*/
var NotFound = React.createClass({
  render: function() {
    return (
      <div className="main"><h1>Not Found</h1></div>
    );
  }
});

/**
* Import - web-form to import data to the Component Registry
* @constructor
*/
var Import = React.createClass({
  mixin: [Authentication],
  render: function() {
    return <div className="main"><h1>Importer</h1></div>
  }
});

/***
* Main - Default component and entry point to the application.
* @constructor
*/
var Main = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
      displayName: ''
    };
  },
  setStateOnAuth: function(loggedIn, displayName) {
    this.setState({
      loggedIn: loggedIn,
      displayName: displayName
    });
  },
  childContextTypes: {
      loggedIn: React.PropTypes.bool.isRequired,
      displayName: React.PropTypes.string
  },
  getChildContext: function() {
       return { loggedIn: this.state.loggedIn, displayName: this.state.displayName };
  },
  componentWillMount: function() {
    //TODO use Webpack console setting for production
    /*$(document).ready(function() {
      window['console']['log'] = function() {};
    });*/
    auth.onChange = this.setStateOnAuth;
    auth.login();
  },
  render: function() {
    var logout = null; //<Link to="logout">logout</Link>;
     var loginOrOut = this.state.loggedIn ?
       <div className="auth-logged-in">{this.state.displayName} <a href={adminUrl + "/userSettings"} target="_blank">settings</a> {logout}</div> :
       <Link to="login">login</Link>;
    return (
      <div>
        <PageHeader>CMDI Component Registry <small>React.js Prototype beta</small></PageHeader>
        <div className="auth-login">{loginOrOut}</div>
        <RouteHandler/>
      </div>
    );
  }
});

// react-router configuration
var routes = (
    <Route handler={Main} path={Config.deploy.path} >
      <NotFoundRoute handler={NotFound}/>
      <Route name="login" handler={Login} />
      <Route name="logout" handler={Logout} />
      <Route name="import" handler={Import} />
      <Route path="editor" handler={ComponentEditor}>
        <Route name="component" path="component/:component" handler={ComponentViewer} />
        <Route name="newComponent" path="component/:component/new" handler={ComponentViewer} />
        <Route name="profile" path="profile/:profile" handler={ComponentViewer} />
        <Route name="newProfile" path="profile/:profile/new" handler={ComponentViewer} />
        <Route name="newEditor" path="new" handler={ComponentViewer} />
      </Route>
      <DefaultRoute handler={ComponentRegApp} />
    </Route>
);

// manage defined routes and history with react-router
Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.getElementById('content'));
});
