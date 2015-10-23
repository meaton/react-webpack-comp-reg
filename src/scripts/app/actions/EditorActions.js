var log = require("loglevel");
var Constants = require("../constants");

var ComponentRegistryClient = require("../service/ComponentRegistryClient");

/**
 * Browser actions
 */
module.exports = {

  openEditor: function(type, space, id) {
    this.dispatch(Constants.OPEN_EDITOR);
    ComponentRegistryClient.loadSpec(type, space, id, "json", function(spec) {
      //success
      this.dispatch(Constants.OPEN_EDITOR_SUCCESS, {type: type, space: space, id: id, spec: spec});
    }.bind(this), function(message) {
      //failure
      log.error(message);
    });

  }

};
