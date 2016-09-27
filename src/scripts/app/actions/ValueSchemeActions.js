var log = require('loglevel');
var update = require('react-addons-update');
var _ = require('lodash');

var Constants = require("../constants");

var ValueSchemeActions = {
  loadValueScheme: function(element) {
    //TODO
    this.dispatch(Constants.LOAD_VALUE_SCHEME);
  }
};

module.exports = ValueSchemeActions;
