'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var GroupStore = Fluxxor.createStore({
  initialize: function(options) {
    this.groups = []

    this.bindActions(
      Constants.LOAD_GROUPS, this.handleLoadGroups
    );
  },

  getState: function() {
    return {
      groups: this.groups
    };
  },

  handleLoadGroups: function(groups) {
    this.loading = true;
    this.emit("change");
  }
});

module.exports = GroupStore;
