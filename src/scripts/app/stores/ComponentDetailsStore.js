var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    ExpansionState = require("../service/ExpansionState");

var ComponentSpecStore = Fluxxor.createStore({
  initialize: function(options) {
    this.loading = false;
    this.spec = null;
    this.xml = null;
    this.comments = [];
    this.errorMessage = null;
    this.activeView = Constants.INFO_VIEW_SPEC;
    this.expansionState = {expanded: true};

    this.bindActions(
      Constants.LOAD_COMPONENT_SPEC, this.handleLoadSpec,
      Constants.LOAD_COMPONENT_SPEC_SUCCES, this.handleLoadSpecSuccess,
      Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, this.handleLoadSpecXmlSuccess,
      Constants.LOAD_COMPONENT_SPEC_FAILURE, this.handleLoadSpecFailure,
      Constants.TOGGLE_ITEM_EXPANSION, this.handleToggleItemExpansion
      //TODO: comments
    );
  },

  getState: function() {
    return {
      loading: this.loading,
      activeView: this.activeView,
      spec: this.spec,
      xml: this.xml,
      comments: this.comments,
      errorMessage: this.errorMessage,
      expansionState: this.expansionState
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
    this.activeView = Constants.INFO_VIEW_SPEC;
    this.expansionState = {root: true};
    this.emit("change");
  },

  handleLoadSpecXmlSuccess: function(xml) {
    // XML spec loaded
    this.loading = false;
    this.xml = xml;
    this.activeView = Constants.INFO_VIEW_XML;
    this.emit("change");
  },

  handleLoadSpecFailure: function(message) {
    // loading failed (XML or JSON)
    this.loading = false;
    this.errorMessage = message;
    this.emit("change");
  },

  handleToggleItemExpansion: function(itemId) {
    console.log("Toggle " + itemId);
    var currentState = ExpansionState.isExpanded(this.expansionState, itemId);
    console.log("Current state: " + currentState);
    this.expansionState = ExpansionState.setChildState(this.expansionState, itemId, !currentState);
    console.log("Expansion state: " + JSON.stringify(this.expansionState));
    this.emit("change");
  }

});

module.exports = ComponentSpecStore;
