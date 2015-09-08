var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ComponentSpecStore = Fluxxor.createStore({
  initialize: function(options) {
    this.loading = false;
    this.spec = null;
    this.xml = null;
    this.errorMessage = null;

    this.bindActions(
      Constants.LOAD_COMPONENT_SPEC, this.handleLoadSpec,
      Constants.LOAD_COMPONENT_SPEC_SUCCES, this.handleLoadSpecSuccess,
      Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, this.handleLoadSpecXmlSuccess,
      Constants.LOAD_COMPONENT_SPEC_FAILURE, this.handleLoadSpecFailure
    );
  },

  getState: function() {
    return {
      loading: this.loading,
      spec: this.spec,
      xml: this.xml,
      errorMessage: this.errorMessage
    };
  },

  handleLoadSpec: function() {
    // loading a spec (XML or JSON)
    this.loading = true;
    this.errorMessage = null;
    this.emit("change");
  },

  handleLoadSpecSuccess: function(spec) {
    // JSON spec loaded
    this.loading = false;
    this.spec = spec;
    this.xml = null;
    this.emit("change");
  },

  handleLoadSpecXmlSuccess: function(xml) {
    // XML spec loaded
    this.loading = false;
    this.xml = xml;
    this.spec = null;
    this.emit("change");
  },

  handleLoadSpecFailure: function(message) {
    // loading failed (XML or JSON)
    this.loading = false;
    this.errorMessage = message;
    this.emit("change");
  }

});

module.exports = ComponentSpecStore;
