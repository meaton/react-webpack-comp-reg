var log = require('loglevel');
var update = require('react-addons-update');
var _ = require('lodash');

var Constants = require("../constants");

var ValueSchemeActions = {
  loadValueScheme: function(element) {
    log.debug("Loading value scheme for element", element);
    //TODO
    this.dispatch(Constants.LOAD_VALUE_SCHEME);
  }
};

module.exports = ValueSchemeActions;
