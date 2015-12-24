'use strict';

var log = require('loglevel');

/**
* WindowFocusMixin - allows for responding to window (tab) focus loss / gain
* @mixin
*/
var WindowFocusMixin = {

  getInitialState: function() {
    return {windowFocus: true};
  },

  componentDidMount: function() {
    // check when window/tab focuses
    $(window).focus(function () {
      if(!this.state.windowFocus) {
        log.trace("Window regained focus");
        if(this.onWindowFocus) {
          this.onWindowFocus();
        }
        this.setState({windowFocus: true});
      }
    }.bind(this));
    $(window).blur(function () {
      log.trace("Window lost focus");
      if(this.onWindowBlur) {
        this.onWindowBlur();
      }
      this.setState({windowFocus: false});
    }.bind(this));

    window.focus();
  },
}

module.exports = WindowFocusMixin;
