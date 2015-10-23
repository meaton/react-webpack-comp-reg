var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    ExpansionState = require("../service/ExpansionState"),
    React = require('react/addons');

var log = require('loglevel');

var update = React.addons.update;

var ComponentSpecStore = Fluxxor.createStore({
  initialize: function(options) {
    this.loading = false;
    this.spec = null;
    this.xml = null;
    this.comments = [];
    this.activeView = Constants.INFO_VIEW_SPEC;
    this.expansionState = {};
    this.linkedComponents = {};

    this.bindActions(
      Constants.LOAD_COMPONENT_SPEC, this.handleLoadSpec,
      Constants.LOAD_COMPONENT_SPEC_SUCCES, this.handleLoadSpecSuccess,
      Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, this.handleLoadSpecXmlSuccess,
      Constants.LOAD_COMPONENT_SPEC_FAILURE, this.handleLoadSpecFailure,
      Constants.TOGGLE_ITEM_EXPANSION, this.handleToggleItemExpansion,
      Constants.LINKED_COMPONENTS_LOADED, this.handleLinkedComponentsLoaded,
      Constants.OPEN_EDITOR_SUCCESS, this.handleLoadSpecSuccess
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
      expansionState: this.expansionState, // object that has a boolean value for each component 'appId' to indicate expansion
      linkedComponents : this.linkedComponents
    };
  },

  handleLoadSpec: function() {
    // loading a spec (XML or JSON)
    this.loading = true;
    this.emit("change");
  },

  handleLoadSpecSuccess: function(result) {
    var spec = result.spec;
    var linkedComponents = result.linkedComponents;

    // JSON spec loaded
    this.loading = false;
    this.spec = spec;

    // reset view state
    this.activeView = Constants.INFO_VIEW_SPEC;
    // reset expansion state
    this.expansionState = {[spec.CMD_Component._appId]: true};
    // reset linked components state
    if(linkedComponents == undefined) {
      this.linkedComponents = {};
    } else {
      this.linkedComponents = linkedComponents;
    }

    this.emit("change");
  },

  handleLoadSpecXmlSuccess: function(xml) {
    // XML spec loaded
    this.loading = false;
    this.xml = xml;
    this.activeView = Constants.INFO_VIEW_XML;
    this.emit("change");
  },

  handleLoadSpecFailure: function() {
    // loading failed (XML or JSON)
    this.loading = false;
    this.emit("change");
  },

  handleToggleItemExpansion: function(itemId) {
    // toggle boolean value in expansion state object (default when undefined is false)
    var currentState = ExpansionState.isExpanded(this.expansionState, itemId);
    console.trace("Toggling", itemId, "currently", currentState);
    this.expansionState = ExpansionState.setChildState(this.expansionState, itemId, !currentState);
    console.trace("New expansion state: ", this.expansionState);
    this.emit("change");
  },

  handleLinkedComponentsLoaded: function(linkedComponents) {
    // additional linked components have been loaded - merge with current set
    this.linkedComponents = update(this.linkedComponents, {$merge: linkedComponents});
    this.emit("change");
  }

});

module.exports = ComponentSpecStore;
