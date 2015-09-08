var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ComponentSpecStore = Fluxxor.createStore({
  initialize: function(options) {
    this.loading = false;
    this.xml = null;
    this.message = null;

    this.bindActions(
      Constants.LOAD_COMPONENT_SPEC, this.handleLoadSpec,
      Constants.LOAD_COMPONENT_SPEC_SUCCES, this.handleLoadSpecSuccess,
      Constants.LOAD_COMPONENT_SPEC_SUCCES_FAILURE, this.handleLoadSpecFailure
    );
  },

  getState: function() {
    return {
      spec: this.spec
    };
  },

  handleLoadSpec: function() {
    this.loading = true;
    this.message = null;
    this.emit("change");
  },

  handleLoadSpecSuccess: function(xml) {
    this.loading = false;
    this.xml = xml;
    this.emit("change");
  },

  handleLoadSpecFailure: function(message) {
    this.loading = false;
    this.message = message;
    this.emit("change");
  }

});

module.exports = ComponentSpecStore;
