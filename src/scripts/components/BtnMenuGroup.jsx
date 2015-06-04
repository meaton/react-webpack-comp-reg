'use strict';

var React = require('react/addons');
var Router = require('react-router');
var ButtonLink = require('react-router-bootstrap').ButtonLink;
//Bootstrap components
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Modal = require('react-bootstrap/lib/Modal');
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');

var ButtonModal = React.createClass({
      mixins: [OverlayMixin],
      getInitialState: function() {
        return {
          isModalOpen: false
        };
      },
      getDefaultProps: function() {
        return { disabled: false };
      },
      onConfirm: function(evt) {
        this.toggleModal();
        this.props.action(evt);
      },
      toggleModal: function() {
        this.setState({
          isModalOpen: !this.state.isModalOpen
        });
      },
      render() {
        return <Button disabled={this.props.disabled} onClick={this.toggleModal}>{this.props.btnLabel}</Button>
      },
      renderOverlay() {
        if(!this.state.isModalOpen) {
          return <span/>;
        }

        var desc = (typeof this.props.desc == "string") ? ( <p className="modal-desc">{this.props.desc}</p> ) : this.props.desc;
        return (
          <Modal bsStyle="primary" title={this.props.title} animation={false} backdrop={true} onRequestHide={this.toggleModal}>
            <div className="modal-body">
              {desc}
              <div className="modal-footer">
                <Button bsStyle="primary" onClick={this.onConfirm}>OK</Button>
                <Button onClick={this.toggleModal}>Cancel</Button>
              </div>
            </div>
          </Modal>
        );
      }
  });

var BtnMenuGroup = React.createClass({
  mixins: [Router.State, Router.Navigation],
  propTypes: {
    mode: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      mode: "normal",
      profile: null,
      component: null
    };
  },
  saveComp: function(isNew) {
    this.props.saveComp(isNew);
  },
  getCancelQueryParams: function() {
    var cancelParams = null;
    if((this.props.newActive && this.props.component != null) || !this.props.newActive)
      cancelParams = { filter: (this.props.newActive) ? "published" : "private",
             type: (this.props.profile != null) ? "profiles" : "components" };
    return cancelParams;
  },
  generateDeleteModal: function() {
    var currentSelection = this.props.profile || this.props.component;
    var selectedRows = $('#testtable tr.selected');
    var deleteIdList = [];
    if(this.props.multiSelect && selectedRows.length > 0)
      selectedRows.each(function() {
        var id = $(this).data().reactid;
        deleteIdList.push((id != undefined && id.indexOf('clarin') > 0) ?
          React.createElement('span', null, id.substr(id.indexOf('$')+1, id.length).replace(/=1/g, '.').replace(/=2/g, ':'), React.createElement('br')) :
          React.createElement('span')
        );
      });
    else
      deleteIdList = currentSelection;

    return (<div className="modal-desc">You will delete the following item(s): <p>{deleteIdList}</p><p>This cannot be undone.</p></div>);
  },
  render: function () {
    var selectedId = this.props.selectedId;
    var componentType = this.props.type;
    var isPublished = !this.props.privateSelect;

    console.log('is newComponent route: ' + this.isActive("newComponent"));
    console.log('is newProfile route: ' + this.isActive("newProfile"));

    switch(this.props.mode) {
      case "normal":
        // TODO: cleanup button link
        var currentSelect = this.props.profile || this.props.component;
        console.log('currentSelect: ' + currentSelect);

        var editorLink = null;
        var editBtnLabel = (this.props.privateSelect) ? "Edit" : "Edit as new";

        if(currentSelect != null) {
          var editorRoute = null;
          if(this.props.profile != null)
            editorRoute = (isPublished) ? "newProfile" : "profile";
          else if(this.props.component != null)
            editorRoute = (isPublished) ? "newComponent" : "component";

          if(editorRoute != null)
            editorLink = <ButtonLink to={editorRoute} params={{profile: this.props.profile, component: this.props.component }} bsStyle="primary" disabled={this.props.multiSelect || (this.props.profile == null && this.props.component == null)}>{editBtnLabel}</ButtonLink>

        } else
          editorLink = <Button bsStyle="primary" disabled={true}>{editBtnLabel}</Button>

        var deleteModalDesc = (!isPublished) ? this.generateDeleteModal() : null;
        return (
            <ButtonGroup className="actionMenu">
              <ButtonLink to="newEditor">Create new</ButtonLink>
              {editorLink}
              <ButtonLink to="import">Import</ButtonLink>
              <ButtonModal {...this.props} action={this.props.deleteComp} disabled={(this.props.profile == null && this.props.component == null) || isPublished}
                btnLabel="Delete"
                title="Delete items"
                desc={deleteModalDesc} />
            </ButtonGroup>
        );
      case "editor":
        return (
          <ButtonGroup className="actionMenu">
            <Button bsStyle={(!this.props.newActive) ? "primary" : "default" } onClick={this.saveComp.bind(this, true)} disabled={this.props.newActive}>Save</Button>
            <Button bsStyle={(this.props.newActive) ? "primary" : "default" } onClick={this.saveComp.bind(this, false)}>Save new</Button>
            <ButtonModal {...this.props} action={this.props.publishComp} disabled={this.props.newActive}
              btnLabel="Publish"
              title="Publish"
              desc="If your profile/component is ready to be used by other people press ok, otherwise press cancel and save it in your workspace or continue editing." />
            <ButtonLink to="/" query={this.getCancelQueryParams()}>Cancel</ButtonLink>
          </ButtonGroup>
        );
      default:
        return null;
    }
  }
});

module.exports = BtnMenuGroup;
