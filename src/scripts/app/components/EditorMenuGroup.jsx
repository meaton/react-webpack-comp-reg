'use strict';

var log = require('loglevel');

var React = require('react/addons');
var Router = require('react-router');

//router bootstrap
var ButtonLink = require('react-router-bootstrap').ButtonLink;

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonModal = require('./ButtonModal');

var Constants = require('../constants');
var Config = require('../../config');

/**
* BtnMenuGroup - displays the Bootstrap button group used to apply actions on selected profile(s) or component(s) in the datatables grid (default route) or on the current item in the editor.
* @constructor
* @mixes Router.State
* @mixes Router.Navigation
*/
var EditorMenuGroup = React.createClass({
  mixins: [Router.State, Router.Navigation],
  propTypes: {
    type: React.PropTypes.string,
    isNew: React.PropTypes.bool,
    onSave: React.PropTypes.func,
    onSaveNew: React.PropTypes.func,
    onPublish: React.PropTypes.func
  },
  render: function () {
    return (
      <ButtonGroup className="actionMenu">
        <Button bsStyle={(!this.props.isNew) ? "primary" : "default" } onClick={this.props.onSave} disabled={this.props.isNew}>Save</Button>
        <Button bsStyle={(this.props.isNew) ? "primary" : "default" } onClick={this.props.onSaveNew}>Save new</Button>
        <ButtonModal {...this.props} action={this.props.onPublish} disabled={this.props.isNew}
          btnLabel="Publish"
          title="Publish"
          desc="If your profile/component is ready to be used by other people press ok, otherwise press cancel and save it in your workspace or continue editing." />
        <ButtonLink to={'browser'}>Cancel</ButtonLink> {/*query={this.getCancelQueryParams()*/}
      </ButtonGroup>
    );
  }
});

module.exports = EditorMenuGroup;
