'use strict';
var log = require('loglevel');

//react
var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var ButtonInput = require('react-bootstrap/lib/ButtonInput');

//utils
var moment = require('moment-timezone');

/**
* Comments - panel that shows comments and (if logged in) a submit form
* @constructor
*/
var Comments = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    comments: React.PropTypes.array.isRequired,
    item: React.PropTypes.object.isRequired,
    loggedIn: React.PropTypes.bool.isRequired,
    saveComment: React.PropTypes.func.isRequired,
    deleteComment: React.PropTypes.func.isRequired,
    newComment: React.PropTypes.object
  },

  getInitialState: function() {
    return {comment: ''};
  },

  componentWillReceiveProps: function(nextProps) {
    if(this.props.newComment != nextProps.newComment) {
      this.setState({comment: nextProps.newComment});
    }
  },

  render: function () {
    return (
      <div>
        {this.renderComments()}
        {this.renderForm()}
      </div>
    );
  },

  renderComments: function() {
    var comments = this.props.comments;
    var isLoggedIn = this.props.loggedIn;
    var commentDelete = this.deleteComment;

    if(comments != null && comments.length > 0)
      return (
        comments.map(function(comment, index) {
          var deleteLink = (isLoggedIn && comment.canDelete === "true" && comment.id != null) ? (
            <span>&nbsp;<a className="delete" onClick={commentDelete.bind(this, comment)}>[delete]</a></span>
          ) : null;

          return (
            <div key={"comment-" + index} className="comment">
              <span className="comment-name">{comment.userName}
              </span><span> - </span>
              <span className="comment-date">{ (comment.commentDate == null) ? null: moment(comment.commentDate).format('LLL') }</span>
              {deleteLink}
              <p className="comment-comments">{comment.comments}</p>
            </div>
          );
        }.bind(this))
      );
    else
      return React.createElement('div', {className: "comment empty"}, "No Comments");
  },

  renderForm: function() {
    var item = this.props.item;
    var xmlElement = null;
    var viewer = null;

    // comments form and submission
    return this.props.loggedIn ? (
      <form name="commentsBox" onSubmit={this.saveComment}>
        <Input onChange={this.handleChangeComment} ref="commentText" value={this.state.comment} id="commentText" type='textarea' label='Add Comment' placeholder='' cols="30" rows="5" />
        <ButtonInput type='submit' value='Submit' />
      </form>
    ) : (
      <p className="loginToPost">Login to enter a comment</p>
    );
  },

  handleChangeComment: function(evt) {
    this.setState({comment: evt.target.value});
  },

  saveComment: function(evt) {
    evt.preventDefault();
    log.debug("Post comment", this.state.comment);
    this.props.saveComment(this.state.comment);
  },

  deleteComment: function(comment) {
    log.debug("Delete comment", comment.id, comment);
    this.props.deleteComment(comment.id);
  }
});


module.exports = Comments;
