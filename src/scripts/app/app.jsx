var log = require('loglevel');

var React = require("react"),
    Fluxxor = require("fluxxor");

var Application = require("./components/application.jsx"),
    BrowserItemsStore = require("./stores/BrowserItemsStore"),
    BrowserSelectionStore = require("./stores/BrowserSelectionStore"),
    ComponentDetailsStore = require("./stores/ComponentDetailsStore"),
    AuthenticationStore = require("./stores/AuthenticationStore"),
    actions = require("./actions");

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
log.setLevel(log.levels.TRACE);

// register on dispatch events
if(log.getLevel() <= log.levels.DEBUG) {
  log.info("Logging Flux events at debug level");
  flux.on("dispatch", function(type, payload) {
    if (console && console.log) {
      log.debug("[Dispatch]", type, payload);
    }
  });
}

/* Done! */
React.render(<Application flux={flux} />, document.getElementById("app"));

log.info("Application started");
