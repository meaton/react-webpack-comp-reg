'use strict';

var React = require('react');

//bootstrap
var DropDownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

//util
var Constants = require('../constants');
var ReactAlert = require('../util/ReactAlert');

/**
* PublishDropDown
* @constructor
*/
var PublishDropDown = React.createClass({
  propTypes: {
    id:  React.PropTypes.string,
    title:  React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onPublish: React.PropTypes.func
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

  render: function() {
    return (
      <DropDownButton {...this.props}>
        <MenuItem eventKey="1" onClick={this.onPublishProduction}>Publish</MenuItem>
        <MenuItem eventKey="2" onClick={this.onPublishDevelopment}>Publish as draft</MenuItem>
      </DropDownButton>
    );
  }
});

module.exports = PublishDropDown;
