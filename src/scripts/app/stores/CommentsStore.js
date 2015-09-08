var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var CommentsStore = Fluxxor.createStore({
  initialize: function(options) {
    this.loading = false;
    this.comments = [];

    this.bindActions(
      Constants.LOAD_COMMENTS, this.handleLoadComments,
      Constants.LOAD_COMMENTS_SUCCESS, this.handleLoadCommentsSuccess,
      Constants.LOAD_COMMENTS_FAILURE, this.handleLoadCommentsFailure
    );
  },

  getState: function() {
    return {
      comments: this.comments
    };
  },

  handleLoadComments: function() {
    this.loading = true;
    this.message = null;
    this.emit("change");
  },

  handleLoadCommentsSuccess: function(comments) {
    this.loading = false;
    this.comments = comments;
    this.emit("change");
  },

  handleLoadCommentsFailure: function(message) {
    this.loading = false;
    this.message = message;
    this.emit("change");
  }
});

module.exports = CommentsStore;
