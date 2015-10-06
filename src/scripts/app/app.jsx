var log = require('loglevel');

var React = require("react"),
    Fluxxor = require("fluxxor");

var Router = require('react-router');
var { Route, RouteHandler, DefaultRoute, Link, NotFoundRoute } = Router;

var Browser = require("./components/Browser.jsx"),
    Main = require("./components/Main.jsx");

var BrowserItemsStore = require("./stores/BrowserItemsStore"),
    BrowserSelectionStore = require("./stores/BrowserSelectionStore"),
    ComponentDetailsStore = require("./stores/ComponentDetailsStore"),
    AuthenticationStore = require("./stores/AuthenticationStore");

var actions = require("./actions");

var Config = require('../config').Config;

// main stylesheets
require('../../styles/main.css');
require('../../styles/normalize.css');

/* Flux */
var stores = {
  BrowserItemsStore: new BrowserItemsStore(),
  BrowserSelectionStore: new BrowserSelectionStore(),
  ComponentDetailsStore: new ComponentDetailsStore(),
  AuthenticationStore: new AuthenticationStore()
};

var flux = new Fluxxor.Flux(stores, actions);
window.flux = flux;

/* Logging */

// global log level
log.setLevel(log.levels.DEBUG);

// register on dispatch events
if(log.getLevel() <= log.levels.DEBUG) {
  log.info("Logging Flux events at debug level");
  flux.on("dispatch", function(type, payload) {
    if (console && console.log) {
      log.debug("[Dispatch]", type, payload);
    }
  });
}

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

// react-router configuration
var routes = (
    <Route handler={Main} path={Config.deploy.path} >
      <NotFoundRoute handler={NotFound}/>
      {/*
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
      */}
      <Route name="browser" handler={Browser} />
      <Route name="import" handler={NotFound} />
      <Route path="editor" handler={NotFound}>
        <Route name="component" path="component/:id" handler={NotFound} />
        <Route name="newComponent" path="component/:id/new" handler={NotFound} />
        <Route name="profile" path="profile/:id" handler={NotFound} />
        <Route name="newProfile" path="profile/:id/new" handler={NotFound} />
        <Route name="newEditor" path="new" handler={NotFound} />
      </Route>
      <DefaultRoute handler={Browser} />
    </Route>
);

// manage defined routes and history with react-router
Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler flux={flux} />, document.getElementById("app"));
});

log.info("Application started");
