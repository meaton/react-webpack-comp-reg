'use strict';

var log = require('loglevel');

var React = require('react');

//router bootstrap
var LinkContainer = require('react-router-bootstrap').LinkContainer;

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Modal = require('react-bootstrap/lib/Modal');

var MoveToTeamDropdown = require('./MoveToTeamDropdown');
var ComponentStatusSelector = require('./ComponentStatusSelector');
var ButtonModal = require('../ButtonModal');
var PublishDropDown = require('../PublishDropDown');

var Constants = require('../../constants');
var Config = require('../../../config');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ComponentUsageMixin = require('../../mixins/ComponentUsageMixin');

/**
* BtnMenuGroup - displays the Bootstrap button group used to apply actions on selected profile(s) or component(s) in the data grid (default route) or on the current item in the editor.
* @constructor
*/
var BrowserMenuGroup = React.createClass({
  mixins: [ImmutableRenderMixin, ComponentUsageMixin],
  propTypes: {
    type: React.PropTypes.string.isRequired,
    space: React.PropTypes.string.isRequired,
    items: React.PropTypes.object,
    teams: React.PropTypes.array,
    loggedIn: React.PropTypes.bool.isRequired,
    moveToTeamEnabled: React.PropTypes.bool,
    moveToTeam: React.PropTypes.func,
    deleteComp: React.PropTypes.func,
    onPublish: React.PropTypes.func,
    onStatusChange: React.PropTypes.func,
    onSetSuccessor: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      items: {},
      teams: [],
      moveToTeam: false
    };
  },

  render: function () {
    var isPublished = this.props.space === Constants.SPACE_PUBLISHED;
    var selectionCount = this.props.items == null ? 0 : Object.keys(this.props.items).length;
    var singleItem = selectionCount == 1 && this.props.items[Object.keys(this.props.items)[0]];

    return (
      <div>
        <ButtonGroup className="actionMenu">

          <LinkContainer to={"/editor/new/"+this.props.space+"/"+this.props.type}
            disabled={!this.props.loggedIn}>
            <Button>Create new</Button>
          </LinkContainer>

          {this.renderEditorLink(singleItem)}

          {this.props.moveToTeamEnabled
            && <MoveToTeamDropdown
            space={this.props.space}
            teams={this.props.teams}
            selectedTeam={this.props.selectedTeam}
            disabled={selectionCount == 0}
            moveToTeam={this.props.moveToTeam} />}

          {!isPublished && (
              <PublishDropDown
                id="publishActions"
                title="Publish"
                disabled={selectionCount != 1}
                onPublish={this.props.onPublish} />)}

          <ButtonModal {...this.props} action={this.props.deleteComp.bind(null, this.handleUsageWarning)} disabled={!this.props.loggedIn || selectionCount == 0 }
            btnLabel="Delete"
            title="Delete items"
            desc={selectionCount == 0 ? null : this.renderDeleteModal()} />

        </ButtonGroup>

        <ButtonGroup className="actionMenu">
          {this.renderStatusDropdown(isPublished, selectionCount)}
          {singleItem && this.renderSuccessorButton(singleItem)}
        </ButtonGroup>
      </div>
    );
  },

  renderEditorLink: function(singleItem) {
    if(singleItem) {
      var isImmutable = singleItem.status.toLowerCase() !== Constants.STATUS_DEVELOPMENT.toLowerCase();
      var editBtnLabel = isImmutable ? "Edit as new" : "Edit";

      var editorRoute = null;
      if(this.props.type === Constants.TYPE_PROFILE) {
        editorRoute = "/editor/" + ((isImmutable) ? "profile/new/" : "/profile/")
          + this.props.space + "/" + singleItem.id;
      } else if(this.props.type === Constants.TYPE_COMPONENT) {
        editorRoute = "/editor/" + ((isImmutable) ? "component/new/" : "/component/")
          + this.props.space + "/" + singleItem.id;
      }

      if(editorRoute != null) {
        return (
          <LinkContainer to={editorRoute} disabled={!this.props.loggedIn}>
            <Button
              bsStyle="primary">
                {editBtnLabel}
            </Button>
          </LinkContainer>
        );
      }
    } else {
      return (<Button bsStyle="primary" disabled>Edit</Button>);
    }
  },

  renderStatusDropdown: function(isPublished, selectionCount) {
    if(selectionCount == 1) {
      var item = this.props.items[Object.keys(this.props.items)[0]];
      var status = item.status.toLowerCase();
    }
    return (<ComponentStatusSelector
      item={item}
      disabled={item == null}
      onStatusChange={this.props.onStatusChange}
      developmentAllowed={false /* never possible to change to development*/ }
      productionAllowed={isPublished && status == Constants.STATUS_DEVELOPMENT.toLowerCase() /* only can go from development to published in public space */}
      deprecatedAllowed={status != Constants.STATUS_DEPRECATED.toLowerCase() /* can always deprecate (or request deprecation) */}
       />);
  },

  renderSuccessorButton: function(item) {
    if(item.status.toLowerCase() == Constants.STATUS_DEPRECATED.toLowerCase()) {
      return (
        <Button onClick={this.props.onSetSuccessor} disabled={item.successor != null && item.successor != ""}>Set successor</Button>
      );
    } else {
      return null;
    }
  },

  renderDeleteModal: function() {
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
