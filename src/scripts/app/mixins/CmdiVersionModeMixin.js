'use strict';

var React = require('react');
var Constants = require('../constants');

/**
* CmdiVersionModeMixin
* @mixin
*/
var CmdiVersionModeMixin = {

  propTypes: {
    cmdiVersionMode: React.PropTypes.string
  },

  getCmdiVersionModeProps: function() {
    return {
      cmdiVersionMode: this.props.cmdiVersionMode
    };
  },

  getCmdiVersionMode: function() {
    return this.props.cmdiVersionMode;
  },

  isCmdi11Mode: function() {
    return this.props.cmdiVersionMode === Constants.CMD_VERSION_1_1;
  },

  isCmdi12Mode: function() {
    return this.props.cmdiVersionMode === Constants.CMD_VERSION_1_2;
  }

}

module.exports = CmdiVersionModeMixin;
