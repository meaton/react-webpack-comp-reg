'use strict';
var Constants = require('../constants');

var React = require('react');

//bootstrap
var Dropdown = require('react-bootstrap/lib/Dropdown');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

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
    onPublish: React.PropTypes.func,
    glyph: React.PropTypes.string
  },

  onPublishProduction: function() {
    ReactAlert.showConfirmationDialogue(
      "Move to public space and put in production?",
      <p>
        If your profile/component is ready to be used by other people and no further changes are required, press <strong>'Yes'</strong>.
        If you would like to keep the item in your private space,  press <strong>'No'</strong>.
      </p>,
      this.props.onPublish.bind(null, Constants.STATUS_PRODUCTION)
    );
  },

  onPublishDevelopment: function() {
    ReactAlert.showConfirmationDialogue(
      "Move to public space as public draft?",
      <p>
        If your profile/component is ready to be used by other people, but still should be open for editing (by you), press <strong>'Yes'</strong>.
        Doing so will cause it to appear in the list of public development items, which are hidden by default but can be seen by any user on request.
        If you would like to keep the item in your private space, press <strong>'No'</strong>.
      </p>,
      this.props.onPublish.bind(null, Constants.STATUS_DEVELOPMENT)
    );
  },

  render: function() {
    return (
      <Dropdown>
        <Dropdown.Toggle disabled={this.props.disabled}>
          {this.props.glyph && <Glyphicon glyph={this.props.glyph}/>} {this.props.title}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem eventKey="1" onClick={this.onPublishProduction}>{this.props.glyph && <Glyphicon glyph={this.props.glyph}/>} Publish</MenuItem>
          <MenuItem eventKey="2" onClick={this.onPublishDevelopment}><Glyphicon glyph={Constants.STATUS_ICON_DEVELOPMENT}/> Publish as draft</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
});

module.exports = PublishDropDown;
