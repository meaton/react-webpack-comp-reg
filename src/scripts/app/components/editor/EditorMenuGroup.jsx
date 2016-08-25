'use strict';

var log = require('loglevel');

var React = require('react');

//router bootstrap
var LinkButton = require('../LinkButton');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var DropDownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonModal = require('../ButtonModal');
var ReactAlert = require('../../util/ReactAlert');
var Constants = require('../../constants');

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

  onPublishProduction: function() {
    ReactAlert.showConfirmationDialogue(
      "Move to public space and put in production?",
      <p>
        If your profile/component is ready to be used by other people and no further changes are required, press <strong>'Yes'</strong>.
      Otherwise press <strong>'No'</strong> and save it in your workspace or continue editing.
      </p>,
      this.props.onPublish.bind(null, Constants.STATUS_PRODUCTION)
    );
  },

  onPublishDevelopment: function() {
    ReactAlert.showConfirmationDialogue(
      "Move to public space as public draft?",
      <p>
        If your profile/component is ready to be used by other people, but still should be open for editing (by you), press <strong>'Yes'</strong>.
      Otherwise press <strong>'No'</strong> and save it in your workspace or continue editing.
      </p>,
      this.props.onPublish.bind(null, Constants.STATUS_DEVELOPMENT)
    );
  },

  render: function () {
    return (
      <ButtonGroup className="actionMenu">
        <Button bsStyle={(!this.props.isNew) ? "primary" : "default" } onClick={this.props.onSave} disabled={this.props.disabled || this.props.isNew}>Save</Button>
        <Button bsStyle={(this.props.isNew) ? "primary" : "default" } onClick={this.props.onSaveNew} disabled={this.props.disabled} >Save new</Button>
        <DropDownButton id="publishActions" title="Publish" {...this.props} disabled={this.props.disabled || this.props.isNew}>
          <MenuItem eventKey="1" onClick={this.onPublishProduction}>Publish</MenuItem>
          <MenuItem eventKey="2" onClick={this.onPublishDevelopment}>Publish as draft</MenuItem>
        </DropDownButton>
        <Button onClick={this.props.onCancel} disabled={this.props.disabled}>Cancel</Button>
      </ButtonGroup>
    );
  }
});

module.exports = EditorMenuGroup;
