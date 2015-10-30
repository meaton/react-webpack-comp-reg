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
    //mode: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {};
  },
  saveComp: function(isNew) {
    this.props.saveComp(!isNew, isNew);
  },
  getCancelQueryParams: function() {
    var cancelParams = null;
    if((this.props.newActive && this.props.component != null) || !this.props.newActive)
      cancelParams = { filter: (this.props.newActive) ? "published" : "private",
             type: (this.props.profile != null) ? "profiles" : "components" };
    return cancelParams;
  },
  render: function () {
    // var selectedId = this.props.selectedId;
    // var componentType = this.props.type;
    // var isPublished = !this.props.privateSelect;

    return (
      <ButtonGroup className="actionMenu">
        <Button bsStyle={(!this.props.newActive) ? "primary" : "default" } onClick={this.saveComp.bind(this, false)} disabled={this.props.newActive}>Save</Button>
        <Button bsStyle={(this.props.newActive) ? "primary" : "default" } onClick={this.saveComp.bind(this, true)}>Save new</Button>
        <ButtonModal {...this.props} action={this.props.publishComp} disabled={this.props.newActive}
          btnLabel="Publish"
          title="Publish"
          desc="If your profile/component is ready to be used by other people press ok, otherwise press cancel and save it in your workspace or continue editing." />
        <ButtonLink to={Config.deploy.path} query={this.getCancelQueryParams()}>Cancel</ButtonLink>
      </ButtonGroup>
    );
  }
});

module.exports = EditorMenuGroup;
