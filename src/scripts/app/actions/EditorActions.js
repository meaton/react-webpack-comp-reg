var log = require("loglevel");
var Constants = require("../constants");

var ComponentRegistryClient = require("../service/ComponentRegistryClient");

/**
 * Browser actions
 */
module.exports = {

  openEditor: function(type, space, id) {
    this.dispatch(Constants.OPEN_EDITOR, {type: type, space: space, id: id});
  },

  setType: function(spec, type) {
    log.debug("setType", spec, type);
  },

  updateHeader: function(spec, change) {
    log.debug("updateHeader", spec, "change:", change);
  }

};
