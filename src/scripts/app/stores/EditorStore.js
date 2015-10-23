var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    ExpansionState = require("../service/ExpansionState"),
    React = require('react/addons');

var log = require('loglevel');

var update = React.addons.update;

var EditorStore = Fluxxor.createStore({
  initialize: function(options) {
    this.type = Constants.TYPE_COMPONENTS; //components or profiles
    this.space = Constants.SPACE_PUBLISHED; //private, group, published

    // component spec itself is stored in the component details store for the editor

    this.bindActions(
      // Constants.LOAD_COMPONENT_SPEC, this.handleLoadSpec,
      // Constants.LOAD_COMPONENT_SPEC_SUCCES, this.handleLoadSpecSuccess,
      // Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, this.handleLoadSpecXmlSuccess,
      // Constants.LOAD_COMPONENT_SPEC_FAILURE, this.handleLoadSpecFailure,
      // Constants.TOGGLE_ITEM_EXPANSION, this.handleToggleItemExpansion,
      // Constants.LINKED_COMPONENTS_LOADED, this.handleLinkedComponentsLoaded
      Constants.OPEN_EDITOR, this.handleOpenEditor,
      Constants.OPEN_EDITOR_SUCCESS, this.handleOpenEditorSuccess
    );
  },

  getState: function() {
    return {
      type: this.type,
      space: this.space
    };
  },

  handleOpenEditor: function() {
  },

  handleOpenEditorSuccess: function(obj) {
    var type = obj.type;
    var space = obj.space;
    var id = obj.id;
  }

});

module.exports = EditorStore;
