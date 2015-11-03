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
    this.item = null;
    this.processing = false;

    // component spec itself is stored in the component details store for the editor

    this.bindActions(
      Constants.OPEN_EDITOR, this.handleOpenEditor,
      Constants.LOAD_ITEM_SUCCESS, this.handleLoadItem,
      Constants.LOAD_ITEM_FAILURE, this.handleLoadItemFailure,
      Constants.ITEM_UPDATED, this.handleLoadItem,
      Constants.SAVE_COMPONENT_SPEC, this.handleSave,
      Constants.SAVE_COMPONENT_SPEC_SUCCESS, this.handleSaveDone,
      Constants.SAVE_COMPONENT_SPEC_FAILURE, this.handleSaveDone
    );
  },

  getState: function() {
    return {
      type: this.type,
      space: this.space,
      item: this.item,
      processing: this.processing
    };
  },

  handleLoadItem: function(item) {
    this.item = item
    this.emit("change");
  },

  handleLoadItemFailure: function() {
    this.item = null;
    this.emit("change");
  },

  handleOpenEditor: function(obj) {
    var type = obj.type;
    var space = obj.space;
    var id = obj.id;

    this.emit("change");
  },

  handleSave: function() {
    this.processing = true;
    this.emit("change");
  },

  handleSaveDone: function() {
    this.processing = false;
    this.emit("change");
  }

});

module.exports = EditorStore;
