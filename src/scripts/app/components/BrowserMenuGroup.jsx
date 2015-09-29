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
    item: React.PropTypes.object,
    loggedIn: React.PropTypes.bool.isRequired,
    multiSelect: React.PropTypes.bool.isRequired,
    deleteComp: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return { item: null };
  },
  generateDeleteModal: function() {
    var currentSelection = this.props.profile || this.props.component;
    var selectedRows = $('#testtable tr.selected');
    var deleteIdList = [];
    if(selectedRows.length > 0)
      selectedRows.each(function() {
        var id = $(this).data().reactid;
        if(id != undefined && id.indexOf('clarin') > 0) {
          id = id.substr(id.indexOf('$')+1, id.length).replace(/=1/g, '.').replace(/=2/g, ':')
          deleteIdList.push(React.createElement('li', { key: id }, $(this).find('td.name').text()));
        }
      });
    return (
      <div className="modal-desc">You will delete the following item(s):
        <ul>{deleteIdList}</ul>
        <p>This cannot be undone.</p>
      </div>
    );
  },
  render: function () {
    //var selectedId = this.props.item.id;
    // var componentType = this.props.type;
    // var space = this.props.space;
    var isPublished = this.props.space !== Constants.SPACE_PRIVATE;

    var editorLink = null;
    var editBtnLabel = isPublished ? "Edit as new" : "Edit";

    if(this.props.item != null) {
      var editorRoute = null;
      if(this.props.type === Constants.TYPE_PROFILE) {
        editorRoute = (isPublished) ? "newProfile" : "profile";
      } else if(this.props.type === Constants.TYPE_COMPONENTS) {
        editorRoute = (isPublished) ? "newComponent" : "component";
      }

      if(editorRoute != null) {
        editorLink = (
          <ButtonLink
            to={editorRoute}
            params={{id: this.props.item.id}}
            bsStyle="primary"
            disabled={this.props.multiSelect || this.props.item == null}>
              {editBtnLabel}
          </ButtonLink>
        );
      }
    } else {
      editorLink = <Button bsStyle="primary" disabled={true}>{editBtnLabel}</Button>
    }

    return (
        <ButtonGroup className="actionMenu">
          <ButtonLink to="newEditor" disabled={!this.props.loggedIn}>Create new</ButtonLink>
          {editorLink}
          <ButtonLink to="import" disabled={!this.props.loggedIn}>Import</ButtonLink>
          <ButtonModal {...this.props} action={this.props.deleteComp} disabled={this.props.item == null || isPublished}
            btnLabel="Delete"
            title="Delete items"
            desc={this.generateDeleteModal()} />
        </ButtonGroup>
    );
  }
});

module.exports = BrowserMenuGroup;
