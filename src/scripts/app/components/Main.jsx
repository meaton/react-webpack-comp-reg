var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Router = require('react-router');
var { Route, RouteHandler, DefaultRoute, Link, NotFoundRoute } = Router;

// Components
var AuthState = require("./AuthState.jsx");
var AlertsView = require("./AlertsView.jsx");

// Boostrap
var PageHeader = require('react-bootstrap/lib/PageHeader');
var Alert = require('react-bootstrap/lib/Alert');

/***
* Main - Default component and entry point to the application.
* @constructor
*/
var Main = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("AuthenticationStore", "MessageStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      auth: flux.store("AuthenticationStore").getState(),
      messages: flux.store("MessageStore").getState()
    };
  },

  componentDidMount: function() {
    this.checkAuthState();
    // check auth state every 30s
    this.authInterval = setInterval(this.checkAuthState, 30*1000);
  },

  componentWillUnmount: function() {
    clearInterval(this.authInterval);
  },

  checkAuthState: function() {
    this.getFlux().actions.checkAuthState();
  },

  handleDismissMessage: function(id) {
    this.getFlux().actions.dismissMessage(id);
  },

  render: function() {
    return (
        <div>
          <PageHeader>CMDI Component Registry <small>React.js Prototype beta</small></PageHeader>

          <div className="auth-login">
            <AuthState authState={this.state.auth.authState} />
          </div>

          <section className="application-container">
            <div className="main container-fluid">
              <AlertsView messages={this.state.messages.messages} onDismiss={this.handleDismissMessage} />
              <RouteHandler/>
            </div>
          </section>
        </div>
    );
  }
});


module.exports = Main;
