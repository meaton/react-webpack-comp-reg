'use strict';

var log = require('loglevel');

var React = require('react');

//router bootstrap
var LinkButton = require('../LinkButton');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonModal = require('../ButtonModal');
var PublishDropDown = require('../PublishDropDown');

/**
* EditorMenuGroup
* @constructor
*/
var EditorMenuGroup = React.createClass({
  propTypes: {
    isNew: React.PropTypes.bool,
    onSave: React.PropTypes.func,
    onSaveNew: React.PropTypes.func,
    onPublish: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    disabled: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      disabled: true
    };
  },

  render: function () {
    return (
      <ButtonGroup className="actionMenu">
        <Button bsStyle={(!this.props.isNew) ? "primary" : "default" } onClick={this.props.onSave} disabled={this.props.disabled || this.props.isNew}>Save</Button>
        <Button bsStyle={(this.props.isNew) ? "primary" : "default" } onClick={this.props.onSaveNew} disabled={this.props.disabled} >Save new</Button>
        <PublishDropDown id="publishActions" title="Publish" disabled={this.props.disabled || this.props.isNew} onPublish={this.props.onPublish} />
        <Button onClick={this.props.onCancel} disabled={this.props.disabled}>Cancel</Button>
      </ButtonGroup>
    );
  }
});

module.exports = EditorMenuGroup;
