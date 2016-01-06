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
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

var ReactAlert = require('../util/ReactAlert');

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
    log.trace("Location", this.props.location);

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
      this.getFlux().actions.switchSpace(type, itemSpace, team);
      this.getFlux().actions.loadItems(type, itemSpace, team);
      this.getFlux().actions.selectBrowserItemId(type, itemId, itemSpace, team);

      //TODO support alternatively selecting xml/comments ('browserview' parameter)?
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
          <div id="header">
            <PageHeader>CMDI Component Registry</PageHeader>

            <div className="auth-login">
              <AuthState
                authState={this.state.auth.authState}
                history={this.history}
                location={this.props.location} />
            </div>
          </div>

          <div className="main container-fluid">
            <AlertsView messages={this.state.messages.messages} onDismiss={this.handleDismissMessage} />
            {this.props.children}
          </div>

          <div className="footer">
            <div className="version"><a title="About" onClick={this.showAbout}><Glyphicon glyph="info-sign" />&nbsp;Version 2.0-beta</a></div>
            <div className="logo">
              <a href="https://www.clarin.eu">
                <img src="https://infra.clarin.eu/content/Centre_Registry/CLARIN_style/1.0//CLARIN-Logo_4C14pure3_noextraneouscanvas.png" />
              </a>
            </div>
            <div className="contact"><a title="Contact" href="mailto:cmdi@clarin.eu"><Glyphicon glyph="envelope" />&nbsp;Contact us</a></div>
          </div>
        </div>
    );
  },

  showAbout: function() {
    ReactAlert.showMessage("About CLARIN Component Registry", (
      <div className="aboutBox">
        <p>
          The <a href="https://www.clarin.eu">CLARIN</a> Component Registry
          provides long term storage and easy browsing, creation and editing of
          components and profiles.
        </p>
        <table>
          <tr>
            <td>Back end version:</td>
            <td>2.0-beta</td>
          </tr>
          <tr>
            <td>Front end version:</td>
            <td>1.0-beta</td>
          </tr>
          <tr>
            <td>License:</td>
            <td>GPL</td>
          </tr>
          <tr>
            <td>Source code:</td>
            <td><a href="https://github.com/clarin-eric">https://github.com/clarin-eric</a></td>
          </tr>
          <tr>
            <td>Written by:</td>
            <td>Patrick Duin, Twan Goosen, Mitchell Seaton, Olha Shkaravska, George Georgovassilis, Jean-Charles Ferrieres</td>
          </tr>
        </table>
        <p>Go to <a href="https://www.clarin.eu/cmdi">www.clarin.eu/cmdi</a> for more information.<br/>
        Email <a href="mailto:cmdi@clarin.eu">cmdi@clarin.eu</a> for questions/support.</p>
      </div>
    ));
  }
});


module.exports = Main;
