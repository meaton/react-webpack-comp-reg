var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor");

// Mixins
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
var WindowFocusMixin = require('../mixins/WindowFocusMixin');
var History = require('react-router').History;

// Components
var AuthState = require("./AuthState.jsx").AuthState;
var AlertsView = require("./AlertsView.jsx");

// Boostrap
var PageHeader = require('react-bootstrap/lib/PageHeader');
var Alert = require('react-bootstrap/lib/Alert');

/***
* Main - Default component and entry point to the application.
* @constructor
*/
var Main = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin("AuthenticationStore", "MessageStore"), WindowFocusMixin, History],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      auth: flux.store("AuthenticationStore").getState(),
      messages: flux.store("MessageStore").getState()
    };
  },

  componentWillMount: function() {
    // select space and item according to params
    log.debug("Location", this.props.location);

    var queryParams = this.props.location.query;

    var itemId = queryParams.item || queryParams.itemId;
    var space = queryParams.registrySpace || queryParams.space;
    if(space === "group") {
      // "team" used to be "group"
      space = Constants.SPACE_TEAM;
    }
    var type = queryParams.type;
    var team = queryParams.teamId || queryParams.groupId;

    if(itemId != null) {
      //switch to correct space and type
      type = type || itemId.indexOf("clarin.eu:cr1:p_") >= 0?Constants.TYPE_PROFILE:Constants.TYPE_COMPONENT;

      // select a specific item. If no space specified, assume public
      var itemSpace =  space || Constants.SPACE_PUBLISHED;
      log.debug("Selecting item from parameter. Type:",type, "- id:", itemId, "- space:", itemSpace, "- teamId:", team);
      this.getFlux().actions.switchSpace(type, space, team);
      this.getFlux().actions.loadItems(type, space, team);
      this.getFlux().actions.selectBrowserItemId(type, itemId, space, team);
      this.getFlux().actions.loadComponentSpec(type, itemId);
    } else if(space != null || type != null) {
      // space specified (but not item). If no type specified, assume profile.
      type = type || Constants.TYPE_PROFILE;
      space = space || Constants.SPACE_PUBLISHED;
      this.getFlux().actions.switchSpace(type, space, team);
      this.getFlux().actions.loadItems(type, space, team);
    }
  },

  componentDidMount: function() {
    this.checkAuthState();
    // check auth state every 30s
    this.authInterval = setInterval(this.checkAuthState, 30*1000);
  },

  onWindowFocus: function() {
    this.checkAuthState();
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
        <div id="app-root">
          <PageHeader>CMDI Component Registry <small>React.js front end alpha</small></PageHeader>

          <div className="auth-login">
            <AuthState
              authState={this.state.auth.authState}
              history={this.history}
              location={this.props.location} />
          </div>

          <div className="main container-fluid">
            <AlertsView messages={this.state.messages.messages} onDismiss={this.handleDismissMessage} />
            {this.props.children}
          </div>
        </div>
    );
  }
});


module.exports = Main;
