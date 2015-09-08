var React = require("react"),
    Fluxxor = require("fluxxor");

var Application = require("./components/application.jsx"),
    BrowserItemsStore = require("./stores/BrowserItemsStore"),
    BrowserSelectionStore = require("./stores/BrowserSelectionStore"),
    ComponentSpecStore = require("./stores/ComponentSpecStore"),
    CommentsStore = require("./stores/CommentsStore"),
    actions = require("./actions");

// main stylesheets
require('../../styles/main.css');
require('../../styles/normalize.css');

var stores = {
  BrowserItemsStore: new BrowserItemsStore(),
  BrowserSelectionStore: new BrowserSelectionStore(),
  ComponentSpecStore: new ComponentSpecStore(),
  CommentsStore: new CommentsStore()
};

var flux = new Fluxxor.Flux(stores, actions);
window.flux = flux;

flux.on("dispatch", function(type, payload) {
  if (console && console.log) {
    console.log("[Dispatch]", type, payload);
  }
});

React.render(<Application flux={flux} />, document.getElementById("app"));
