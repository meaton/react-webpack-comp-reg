'use strict';

var log = require('loglevel');

var React = require('react');

//router bootstrap
var LinkButton = require('../LinkButton');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonModal = require('../ButtonModal');

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
        <ButtonModal {...this.props} action={this.props.onPublish} disabled={this.props.disabled || this.props.isNew}
          btnLabel="Publish"
          title="Publish"
          desc="If your profile/component is ready to be used by other people press ok, otherwise press cancel and save it in your workspace or continue editing." />
        <LinkButton to="/browser" disabled={this.props.disabled}>Cancel</LinkButton>
      </ButtonGroup>
    );
  }
});

module.exports = EditorMenuGroup;
