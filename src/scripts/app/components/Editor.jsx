'use strict';

var log = require('loglevel');

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var {RouteHandler, Navigation} = require('react-router');

require('../../../styles/ComponentEditor.sass');

/**
* ComponentEditor - main editor component and route handler for editor subroutes
* @constructor
*/
var Editor = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("AuthenticationStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      auth: flux.store("AuthenticationStore").getState()
    };
  },

  componentDidMount: function() {
    if(!this.isAuthenticated()) {
      // try to trigger a login
      var loginForm = $("form.login-form");
      // we're assuming that the AuthState component is rendered somehwere on the page
      log.info(loginForm);
      if(loginForm.length) {
        loginForm.submit();
      } else {
        alert("Please authenticate manually by pressing the login button");
        log.warn("Could not trigger login, login form not found on page");
      }
    }
  },

  render: function () {
    if(this.isAuthenticated()) {
      return (
        <section id="editor">
          <h2>Component Editor</h2>
          <RouteHandler/>
          {/*grid*/}
        </section>
        );
    } else {
      // on mount, login should be triggered
      return <div>Login required to edit</div>;
    }
  },

  isAuthenticated: function() {
    return this.state.auth.authState.authenticated;
  }
});

module.exports = Editor;
