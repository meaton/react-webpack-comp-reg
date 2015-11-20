'use strict';

var log = require('loglevel');

//helpers
var ExpansionState = require('../service/ExpansionState');

/**
* ToggleExpansionMixin - Common functions for components, related to expansion state
* @mixin
*/
var ToggleExpansionMixin = {
  propTypes: {
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
    expansionState: React.PropTypes.object,
    onToggle: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      openAll: false,
      closeAll: false
    };
  },

  toggleExpansionState: function() {
    this.props.onToggle(this.props.spec._appId, this.props.spec, this.getDefaultOpenState());
  },

  isOpen: function() {
    var defaultState = this.getDefaultOpenState();
    return ExpansionState.isExpanded(this.props.expansionState, this.props.spec._appId, defaultState);
  }
}

module.exports = ToggleExpansionMixin;
