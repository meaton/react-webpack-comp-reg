'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ValueSchemeStore = Fluxxor.createStore({
  initialize: function(options) {
    this.allowedTypes = null;
    this.vocabulary = null;
    this.type = null;
    this.pattern =  null;
    this.tab = Constants.VALUE_SCHEME_TAB_TYPE;

    this.bindActions(
      Constants.LOAD_ALLOWED_TYPES_SUCCESS, this.handleLoadAllowedTypes,
      Constants.LOAD_VALUE_SCHEME, this.handleLoadValueScheme,
      Constants.UPDATE_VALUE_SCHEME, this.handleUpdateValueScheme,
      Constants.SET_VALUE_SCHEME_TAB, this.setTab
    );
  },

  getState: function() {
    return {
      allowedTypes: this.allowedTypes,
      vocabulary: this.vocabulary,
      type: this.type,
      pattern: this.pattern,
      tab: this.tab
    };
  },

  handleLoadAllowedTypes: function(data) {
    this.allowedTypes = data;
    this.emit("change");
  },

  handleLoadValueScheme: function(values) {
    this.vocabulary = values.vocabulary;
    this.type = values.type;
    this.pattern = values.pattern;
    this.emit("change");
  },

  handleUpdateValueScheme: function(values) {
    if(values.vocabulary != undefined) {
      this.vocabulary = values.vocabulary;
    }
    if(values.type != undefined) {
      this.type = values.type;
    }
    if(values.pattern != undefined) {
      this.pattern = values.pattern;
    }
    this.emit("change");
  },

  setTab: function(tab) {
    this.tab = tab;
    this.emit("change");
  }
});

module.exports = ValueSchemeStore;
