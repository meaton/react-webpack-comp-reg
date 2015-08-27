var React = require("react"),
    Fluxxor = require("fluxxor");

var Application = require("./components/application.jsx"),
    ItemsStore = require("./stores/ItemsStore"),
    BrowserSelectionStore = require("./stores/BrowserSelectionStore"),
    actions = require("./actions");

// main stylesheets
require('../../styles/main.css');
require('../../styles/normalize.css');

var stores = {
  ItemsStore: new ItemsStore(),
  BrowserSelectionStore: new BrowserSelectionStore()
};

var flux = new Fluxxor.Flux(stores, actions);
window.flux = flux;

flux.on("dispatch", function(type, payload) {
  if (console && console.log) {
    console.log("[Dispatch]", type, payload);
  }
});

React.render(<Application flux={flux} />, document.getElementById("app"));
