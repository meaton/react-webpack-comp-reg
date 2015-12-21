var log = require('loglevel');

var React = require("react"),
    ReactDOM = require("react-dom"),
    Fluxxor = require("fluxxor");

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var Browser = require("./components/browser/Browser.jsx"),
    Main = require("./components/Main.jsx"),
    Editor = require("./components/editor/Editor.jsx");
    EditorForm = require("./components/editor/EditorForm.jsx");

var ItemsStore = require("./stores/ItemsStore"),
    SelectionStore = require("./stores/SelectionStore"),
    ComponentDetailsStore = require("./stores/ComponentDetailsStore"),
    AuthenticationStore = require("./stores/AuthenticationStore"),
    MessageStore = require("./stores/MessageStore"),
    EditorStore = require("./stores/EditorStore"),
    TeamStore = require("./stores/TeamStore");

var actions = require("./actions");

var Config = require('../config').Config;

// main stylesheets
require('../../styles/main.css');
require('../../styles/normalize.css');

/* Flux */
var stores = {
  ItemsStore: new ItemsStore(),
  SelectionStore: new SelectionStore(),
  ComponentDetailsStore: new ComponentDetailsStore(),
  AuthenticationStore: new AuthenticationStore(),
  MessageStore: new MessageStore(),
  EditorStore: new EditorStore(),
  TeamStore: new TeamStore()
};

var flux = new Fluxxor.Flux(stores, actions);
window.flux = flux;

/* Logging */

// global log level
log.setLevel(Config.loglevel || log.levels.INFO);

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

var createFluxComponent = function(Component, props) {
  return <Component {...props} flux={flux} />;
};

//note: root path used to be {Config.deploy.path}, changed this when upgraded to react-router 1.0.0
ReactDOM.render((
  <Router createElement={createFluxComponent}>
    <Route path="/" component={Main}>
      <IndexRoute component={Browser} />
      <Route path="browser" component={Browser} />
      <Route path="import" component={NotFound /*Import*/} />
      <Route path="editor" component={Editor}>
        <Route path="component/:space/:componentId" component={EditorForm} />
        <Route path="component/new/:space/:componentId" component={EditorForm} />
        <Route path="profile/:space/:profileId" component={EditorForm} />
        <Route path="profile/new/:space/:profileId" component={EditorForm} />
        <Route path="new/:space/:type" component={EditorForm} />
      </Route>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
), document.getElementById("app"));
log.info("Application started");
