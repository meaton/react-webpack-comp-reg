'use strict';
var log = require('loglevel');

var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var TeamStore = Fluxxor.createStore({
  initialize: function(options) {
    this.teams = []

    this.bindActions(
      Constants.LOAD_GROUPS, this.handleLoadTeams
    );
  },

  getState: function() {
    return {
      teams: this.teams
    };
  },

  handleLoadTeams: function(teams) {
    if(teams != null && !$.isArray(teams)) {
      this.teams = [teams];
    } else {
      this.teams = teams;
    }
    this.emit("change");
  }
});

module.exports = TeamStore;
