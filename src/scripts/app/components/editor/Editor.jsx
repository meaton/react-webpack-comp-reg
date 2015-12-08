'use strict';

var log = require('loglevel');

var React = require("react"),
    Constants = require("../../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var {Navigation} = require('react-router');

var AuthUtil = require('../AuthState').AuthUtil;

require('../../../../styles/ComponentEditor.sass');

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
      if(AuthUtil.triggerLogin()) {
        loginForm.submit();
      } else {
        alert("Please authenticate manually by pressing the login button");
        log.warn("Could not trigger login, login form not found on page");
      }
    }
  },

  render: function () {
    return (
      <section id="editor">
        {this.renderContent()}
      </section>
    );
  },

  renderContent: function() {
    if(this.isAuthenticated()) {
      return (
          <div className="editorContainer">
            {this.props.children}
            {/*grid*/}
          </div>
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
