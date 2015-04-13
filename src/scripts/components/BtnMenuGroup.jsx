'use strict';

var React = require('react/addons');
var Router = require('react-router');
var ButtonLink = require('react-router-bootstrap').ButtonLink;
//Bootstrap components
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Modal = require('react-bootstrap/lib/Modal');
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');

var PublishModal = React.createClass({
      mixins: [OverlayMixin],
      getInitialState() {
        return {
          isModalOpen: false
        };
      },
      onConfirm: function(evt) {
        this.toggleModal();
        this.props.publish(evt);
      },
      toggleModal: function() {
        this.setState({
          isModalOpen: !this.state.isModalOpen
        });
      },
      render() {
        return <Button disabled={this.props.newActive} onClick={this.toggleModal}>Publish</Button>
      },
      renderOverlay() {
        if(!this.state.isModalOpen) {
          return <span/>;
        }

        return (
          <Modal bsStyle="primary" title="Publish" animation={false}>
            <div className="publish-modal-body">
              <p>If your profile/component is ready to be used by other people press ok, otherwise press cancel and save it in your workspace or continue editing.</p>
              <div className="publish-modal-footer">
                <Button bsStyle="primary" onClick={this.onConfirm}>OK</Button>
                <Button onClick={this.toggleModal}>Cancel</Button>
              </div>
            </div>
          </Modal>
        );
      }
  });

var BtnMenuGroup = React.createClass({
  mixins: [ Router.State ],
  propTypes: {
    mode: React.PropTypes.string,
    profile: React.PropTypes.string,
    component: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      mode: "normal",
      profile: null,
      component: null
    };
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

        return (
            <ButtonGroup className="actionMenu">
              <ButtonLink to="newEditor">Create new</ButtonLink>
              {editorLink}
              <ButtonLink to="import">Import</ButtonLink>
            </ButtonGroup>
        );
      case "editor":
        return (
          <ButtonGroup className="actionMenu">
            <Button bsStyle={(!this.props.newActive) ? "primary" : "default" } onClick={this.props.saveComp.bind(this, true)} disabled={this.props.newActive}>Save</Button>
            <Button bsStyle={(this.props.newActive) ? "primary" : "default" } onClick={this.props.saveComp.bind(this, false)}>Save new</Button>
            <PublishModal newActive={this.props.newActive} publish={this.props.publishComp} />
            <ButtonLink to="/">Cancel</ButtonLink>
          </ButtonGroup>
        );
      default:
        return null;
    }
  }
});

module.exports = BtnMenuGroup;
