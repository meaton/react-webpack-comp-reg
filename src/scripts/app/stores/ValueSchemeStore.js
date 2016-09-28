'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ValueSchemeStore = Fluxxor.createStore({
  initialize: function(options) {
    this.vocabulary = null;
    this.type = null;
    this.pattern =  null;

    this.bindActions(
      Constants.LOAD_VALUE_SCHEME, this.handleLoadValueScheme,
      Constants.UPDATE_VALUE_SCHEME, this.handleUpdateValueScheme
    );
  },

  getState: function() {
    return {
      vocabulary: this.vocabulary,
      type: this.type,
      pattern: this.pattern
    };
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
  }
});

module.exports = ValueSchemeStore;
