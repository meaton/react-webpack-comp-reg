var log = require('loglevel');

var React = require("react"),
    Fluxxor = require("fluxxor");

var Router = require('react-router');
var { Route, RouteHandler, DefaultRoute, Link, NotFoundRoute } = Router;

var Browser = require("./components/Browser.jsx"),
    Main = require("./components/Main.jsx"),
    Editor = require("./components/Editor.jsx");

var ItemsStore = require("./stores/ItemsStore"),
    BrowserSelectionStore = require("./stores/BrowserSelectionStore"),
    ComponentDetailsStore = require("./stores/ComponentDetailsStore"),
    AuthenticationStore = require("./stores/AuthenticationStore"),
    MessageStore = require("./stores/MessageStore");

var actions = require("./actions");

var Config = require('../config').Config;

// main stylesheets
require('../../styles/main.css');
require('../../styles/normalize.css');

/* Flux */
var stores = {
  ItemsStore: new ItemsStore(),
  BrowserSelectionStore: new BrowserSelectionStore(),
  ComponentDetailsStore: new ComponentDetailsStore(),
  AuthenticationStore: new AuthenticationStore(),
  MessageStore: new MessageStore()
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
      <Route name="browser" handler={Browser} />
      <Route name="import" handler={NotFound /*Import*/} />
      <Route path="editor" handler={Editor}>
        <Route name="component" path="component/:id" handler={NotFound /*ComponentViewer*/} />
        <Route name="newComponent" path="component/:id/new" handler={NotFound /*ComponentViewer*/} />
        <Route name="profile" path="profile/:id" handler={NotFound /*ComponentViewer*/} />
        <Route name="newProfile" path="profile/:id/new" handler={NotFound /*ComponentViewer*/} />
        <Route name="newEditor" path="new" handler={NotFound /*ComponentViewer*/} />
      </Route>
      <DefaultRoute handler={Browser} />
    </Route>
);

// manage defined routes and history with react-router
Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler flux={flux} />, document.getElementById("app"));
});

log.info("Application started");
