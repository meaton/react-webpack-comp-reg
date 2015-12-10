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
// var routes = (
    // <Route handler={Main} path={Config.deploy.path} >
    //   <NotFoundRoute handler={NotFound}/>
    //   <Route name="browser" handler={Browser} />
    //   <Route name="import" handler={NotFound /*Import*/} />
    //   <Route path="editor" handler={Editor}>
    //     <Route name="component" path="component/:space/:componentId" handler={EditorForm} />
    //     <Route name="newComponent" path="component/new/:space/:componentId" handler={EditorForm} />
    //     <Route name="profile" path="profile/:space/:profileId" handler={EditorForm} />
    //     <Route name="newProfile" path="profile/new/:space/:profileId" handler={EditorForm} />
    //     <Route name="newEditor" path="new/:space/:type" handler={EditorForm} />
    //   </Route>
    //   <DefaultRoute handler={Browser} />
    // </Route>
// );

// manage defined routes and history with react-router
// Router.run(routes, Router.HistoryLocation, function(Handler) {
//   React.render(<Handler flux={flux} />, document.getElementById("app"));
// });
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
