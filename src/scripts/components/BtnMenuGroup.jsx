'use strict';

var React = require('react/addons');
var Router = require('react-router');
var Button = require('react-bootstrap/lib/Button');
var ButtonLink = require('react-router-bootstrap').ButtonLink;
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');

//TODO: ReactLink (router) Button

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
            <Button bsStyle={(!this.props.newActive) ? "primary" : "default" } onClick={this.props.saveComp} disabled={this.props.newActive}>Save</Button>
            <Button bsStyle={(this.props.newActive) ? "primary" : "default" } onClick={this.props.saveNewComp}>Save new</Button>
            <Button onClick={this.props.publishComp} disabled={this.props.newActive}>Publish</Button>
            <ButtonLink to="/">Cancel</ButtonLink>
          </ButtonGroup>
        );
      default:
        return null;
    }
  }
});

module.exports = BtnMenuGroup;
