'use strict';

var React = require('react/addons');
var Button = require('react-bootstrap/lib/Button');
var ButtonLink = require('react-router-bootstrap').ButtonLink;
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');

//TODO: ReactLink (router) Button

var BtnMenuGroup = React.createClass({
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
    switch(this.props.mode) {
      case "normal":
        // TODO: cleanup button link
        var currentSelect = this.props.profile || this.props.component;
        console.log('currentSelect: ' + currentSelect);

        var editorLink = null;
        if(currentSelect != null) {
          var editorRoute = null;
          if(this.props.profile != null)
            editorRoute = "profile";
          else if(this.props.component != null)
            editorRoute = "component";

          if(editorRoute != null)
            editorLink = <ButtonLink to={editorRoute} params={{profile: this.props.profile, component: this.props.component}} bsStyle="primary" disabled={this.props.multiSelect || (this.props.profile == null && this.props.component == null)}>Edit</ButtonLink>
        } else
          editorLink = <Button bsStyle="primary" disabled={true}>Edit</Button>

        return (
            <ButtonGroup className="actionMenu">
              <ButtonLink to="newComponent">Create new</ButtonLink>
              {editorLink}
              <ButtonLink to="import">Import</ButtonLink>
            </ButtonGroup>
        );
      case "editor":
        return (
          <ButtonGroup className="actionMenu">
            <Button bsStyle="primary" onClick={this.props.saveComp}>Save</Button>
            <Button onClick={this.props.saveNewComp}>Save new</Button>
            <Button onClick={this.props.publishComp}>Publish</Button>
            <ButtonLink to="/">Cancel</ButtonLink>
          </ButtonGroup>
        );
      default:
        return null;
    }
  }
});

module.exports = BtnMenuGroup;
