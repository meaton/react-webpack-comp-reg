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
var BrowserMenuGroup = React.createClass({
  mixins: [Router.State, Router.Navigation],
  propTypes: {
    type: React.PropTypes.string.isRequired,
    space: React.PropTypes.string.isRequired,
    items: React.PropTypes.object,
    loggedIn: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    deleteComp: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return { items: {} };
  },
  generateDeleteModal: function() {
    var deleteIdList = [];
    var selectionCount = this.props.items == null ? 0 : Object.keys(this.props.items).length;
    if(selectionCount > 0)
      Object.keys(this.props.items).forEach(function(id, index) {
        var name = this.props.items[id].name;
        deleteIdList.push(React.createElement('li', { key: id }, name));
      }.bind(this));

    var warnPublic = (this.props.space === Constants.SPACE_PUBLISHED)?(
      <p>
        <strong>Note</strong>: deletion from the public space is only allowed
        by the owner of the item within one month after publication. If these
        criteria are not met, you will get an error message that says
        "forbidden".
      </p>
    ):null;

    return (
      <div className="modal-desc">You will delete the following item(s):
        <ul>{deleteIdList}</ul>
        <p>This cannot be undone.</p>
        {warnPublic}
      </div>
    );
  },
  render: function () {
    var isPublished = this.props.space === Constants.SPACE_PUBLISHED;
    var selectionCount = this.props.items == null ? 0 : Object.keys(this.props.items).length;

    var editorLink = null;
    var editBtnLabel = isPublished ? "Edit as new" : "Edit";

    var params = {space: this.props.space};

    if(selectionCount == 1) {
      var itemId = Object.keys(this.props.items)[0];
      var editorRoute = null;
      if(this.props.type === Constants.TYPE_PROFILE) {
        editorRoute = (isPublished) ? "newProfile" : "profile";
        params.profileId = itemId;
      } else if(this.props.type === Constants.TYPE_COMPONENTS) {
        editorRoute = (isPublished) ? "newComponent" : "component";
        params.componentId = itemId;
      }

      if(editorRoute != null) {
        editorLink = (
          <ButtonLink
            to={editorRoute}
            params={params}
            bsStyle="primary"
            disabled={this.props.multiSelect}>
              {editBtnLabel}
          </ButtonLink>
        );
      }
    } else {
      editorLink = <Button bsStyle="primary" disabled={true}>{editBtnLabel}</Button>
    }

    return (
        <ButtonGroup className="actionMenu">
          <ButtonLink to="newEditor" params={{type: this.props.type, space: this.props.space}} disabled={!this.props.loggedIn}>Create new</ButtonLink>
          {editorLink}
          <ButtonLink to="import" disabled={!this.props.loggedIn}>Import</ButtonLink>
          <ButtonModal {...this.props} action={this.props.deleteComp} disabled={!this.props.loggedIn || selectionCount == 0 }
            btnLabel="Delete"
            title="Delete items"
            desc={selectionCount == 0 ? null : this.generateDeleteModal()} />
        </ButtonGroup>
    );
  }
});

module.exports = BrowserMenuGroup;
