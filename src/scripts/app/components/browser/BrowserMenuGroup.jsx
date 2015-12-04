'use strict';

var log = require('loglevel');

var React = require('react/addons');
var Router = require('react-router');

//router bootstrap
var ButtonLink = require('react-router-bootstrap').ButtonLink;

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonModal = require('../ButtonModal');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var ReactAlert = require('../../util/ReactAlert');

var Constants = require('../../constants');
var Config = require('../../../config');

//mixins
var ComponentUsageMixin = require('../../mixins/ComponentUsageMixin');

/**
* BtnMenuGroup - displays the Bootstrap button group used to apply actions on selected profile(s) or component(s) in the datatables grid (default route) or on the current item in the editor.
* @constructor
* @mixes Router.State
* @mixes Router.Navigation
*/
var BrowserMenuGroup = React.createClass({
  mixins: [Router.State, Router.Navigation, ComponentUsageMixin],
  propTypes: {
    type: React.PropTypes.string.isRequired,
    space: React.PropTypes.string.isRequired,
    items: React.PropTypes.object,
    groups: React.PropTypes.array,
    loggedIn: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    moveToGroupEnabled: React.PropTypes.bool,
    moveToGroup: React.PropTypes.func,
    deleteComp: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return {
      items: {},
      groups: [],
      moveToGroup: false
    };
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
          <ButtonModal {...this.props} action={this.props.deleteComp.bind(null, this.handleUsageWarning)} disabled={!this.props.loggedIn || selectionCount == 0 }
            btnLabel="Delete"
            title="Delete items"
            desc={selectionCount == 0 ? null : this.generateDeleteModal()} />
          {this.props.moveToGroupEnabled && this.renderMoveToGroup(selectionCount > 0)}
        </ButtonGroup>
    );
  },

  renderMoveToGroup: function(hasSelection) {
    if($.isArray(this.props.groups) && this.props.groups.length > 0) {
      return (
        <DropdownButton title="Move to team" disabled={!hasSelection}>
            {this.props.groups.map(group => (
                group.id === this.props.selectedGroup ? null :
                <MenuItem
                  key={group.id}
                  onSelect={this.confirmMoveToGroup.bind(this, group.id)}
                  >
                    {group.name}
                </MenuItem>
              )
            )}
        </DropdownButton>
      );
    } else {
      return null;
    }
  },

  confirmMoveToGroup: function(groupId) {
    if(this.props.space != Constants.SPACE_PRIVATE) {
      this.props.moveToGroup(groupId);
    } else {
      // moving out of private space cannot be undone, show warning
      var title = "Move component(s) or profile(s) into team space";
      var message = "Items, once moved to a team space, can not be moved back to your workspace. Do you want to move this item?";
      ReactAlert.showConfirmationDialogue(this, title, message, this.props.moveToGroup.bind(null, groupId));
    }
  },

  /**
   * Required by ComponentUsageMixin
   */
  renderUsageModalContent: function(errors, doContinue, doAbort) {
    return(
      <div>
        <div className="modal-body">
          <div className="modal-desc">
            <div>One of the component you are trying to delete is used in the following component(s) and/or profile(s):
              <ul>{errors}</ul>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div><strong>One or more components have not been deleted!</strong><br/>Please first delete the components and/or profiles listed above.</div>
          <Button onClick={doAbort}>Ok</Button>
        </div>
      </div>
    );
  }
});

module.exports = BrowserMenuGroup;
