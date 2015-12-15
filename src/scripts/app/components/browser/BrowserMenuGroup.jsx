'use strict';

var log = require('loglevel');

var React = require('react');

//router bootstrap
var LinkContainer = require('react-router-bootstrap').LinkContainer;

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonModal = require('../ButtonModal');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Modal = require('react-bootstrap/lib/Modal');

var ReactAlert = require('../../util/ReactAlert');

var Constants = require('../../constants');
var Config = require('../../../config');

//mixins
var ComponentUsageMixin = require('../../mixins/ComponentUsageMixin');

/**
* BtnMenuGroup - displays the Bootstrap button group used to apply actions on selected profile(s) or component(s) in the datatables grid (default route) or on the current item in the editor.
* @constructor
*/
var BrowserMenuGroup = React.createClass({
  mixins: [ComponentUsageMixin],
  propTypes: {
    type: React.PropTypes.string.isRequired,
    space: React.PropTypes.string.isRequired,
    items: React.PropTypes.object,
    teams: React.PropTypes.array,
    loggedIn: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    moveToTeamEnabled: React.PropTypes.bool,
    moveToTeam: React.PropTypes.func,
    deleteComp: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return {
      items: {},
      teams: [],
      moveToTeam: false
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

    if(selectionCount == 1) {
      var itemId = Object.keys(this.props.items)[0];
      var editorRoute = null;
      if(this.props.type === Constants.TYPE_PROFILE) {
        editorRoute = "/editor/" + ((isPublished) ? "profile/new/" : "/profile/")
          + this.props.space + "/" + itemId;
      } else if(this.props.type === Constants.TYPE_COMPONENTS) {
        editorRoute = "/editor/" + ((isPublished) ? "component/new/" : "/component/")
          + this.props.space + "/" + itemId;
      }

      if(editorRoute != null) {
        editorLink = (
          <LinkContainer to={editorRoute} disabled={this.props.multiSelect}>
            <Button
              bsStyle="primary">
                {editBtnLabel}
            </Button>
          </LinkContainer>
        );
      }
    } else {
      editorLink = <Button bsStyle="primary" disabled={true}>{editBtnLabel}</Button>
    }

    return (
        <ButtonGroup className="actionMenu">
          <LinkContainer to={"/editor/new/"+this.props.space+"/"+this.props.type}
            disabled={!this.props.loggedIn}>
            <Button>Create new</Button>
          </LinkContainer>
          {editorLink}
          <LinkContainer to="/import" disabled={!this.props.loggedIn}>
            <Button>Import</Button>
          </LinkContainer>
          <ButtonModal {...this.props} action={this.props.deleteComp.bind(null, this.handleUsageWarning)} disabled={!this.props.loggedIn || selectionCount == 0 }
            btnLabel="Delete"
            title="Delete items"
            desc={selectionCount == 0 ? null : this.generateDeleteModal()} />
          {this.props.moveToTeamEnabled && this.renderMoveToTeam(selectionCount > 0)}
        </ButtonGroup>
    );
  },

  renderMoveToTeam: function(hasSelection) {
    if($.isArray(this.props.teams) && this.props.teams.length > 0) {
      return (
        <DropdownButton id="moveToTeam" title="Move to team" disabled={!hasSelection}>
            {this.props.teams.map(function(team) {
                return (team.id === this.props.selectedTeam) ? null : (
                  <MenuItem
                    key={team.id}
                    onSelect={this.confirmMoveToTeam.bind(this, team.id)}
                    >
                      {team.name}
                  </MenuItem>
                )
              }.bind(this)
            )}
        </DropdownButton>
      );
    } else {
      return null;
    }
  },

  confirmMoveToTeam: function(teamId) {
    if(this.props.space != Constants.SPACE_PRIVATE) {
      this.props.moveToTeam(teamId);
    } else {
      // moving out of private space cannot be undone, show warning
      var title = "Move component(s) or profile(s) into team space";
      var message = "Items, once moved to a team space, can not be moved back to your workspace. Do you want to move this item?";
      ReactAlert.showConfirmationDialogue(title, message, this.props.moveToTeam.bind(null, teamId));
    }
  },

  /**
   * Required by ComponentUsageMixin
   */
  renderUsageModalContent: function(errors, doContinue, doAbort) {
    return [(
      <Modal.Body key="body">
        <div className="modal-desc">
          <div>One of the component you are trying to delete is used in the following component(s) and/or profile(s):
            <ul>{errors}</ul>
          </div>
        </div>
      </Modal.Body>
    ), (
      <Modal.Footer key="footer">
        <div>
          <strong>One or more components have not been deleted!</strong><br/>
          To delete this component, please first delete the components and/or profiles listed above.
        </div>
        <Button onClick={doAbort}>Ok</Button>
      </Modal.Footer>
    )];
  }
});

module.exports = BrowserMenuGroup;
