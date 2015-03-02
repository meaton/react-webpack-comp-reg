'use strict';

var React = require('react');
var {Route} = require('react-router');
var auth = require('./Authentication').auth;

/** Bootstrap components */
var ButtonGroup =  require('react-bootstrap/lib/ButtonGroup');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var ButtonLink = require('react-router-bootstrap').ButtonLink;

var SpaceSelector = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    multiSelect: React.PropTypes.shape({
      value: React.PropTypes.bool.isRequired,
      requestChange: React.PropTypes.func.isRequired
    })
  },
  getInitialState: function() {
    return { currentSpaceIdx: 0,
             currentRegIdx: 0,
             multiSelect: this.props.multiSelect.value,
             spaces: [
                { label: "Public", registry: [{ type: "Profiles", filter: "published" }, { type: "Components", filter: "published" }], loginRequired: false },
                { label: "Private", registry: [{ type: "Profiles", filter: "private" }, { type: "Components", filter: "private" }], loginRequired: true }
             ]};
  },
  spaceSelect: function(nextState, event) {
    console.log('clicked: ' + nextState.currentSpaceIdx);
    console.log('mstate: ' + nextState.currentRegIdx);
    if(this.state.currentSpaceIdx != nextState.currentSpaceIdx || this.state.currentRegIndex != nextState.currentRegIdx) {
      var registryName = this.state.spaces[nextState.currentSpaceIdx].registry[nextState.currentRegIdx];
      console.log('changed props: ' + registryName.filter);

      this.props.onSelect(registryName);
      this.setState(nextState);
    }
  },
  toggleSelect: function(evt) {
    this.props.multiSelect.requestChange(!this.state.multiSelect);
    this.props.onChange();
  },
  openViewer: function(evt) {
    console.log(JSON.stringify(this.props.currentSelection));
    // transition to new route component/:componentId
  },
  componentWillReceiveProps: function(nextProps) {
    if(this.props.multiSelect.value != nextProps.multiSelect.value)
      this.setState({multiSelect: nextProps.multiSelect.value});
    if(JSON.stringify(this.props.currentSelection) != JSON.stringify(nextProps.currentSelection))
      this.forceUpdate();
  },
  componentWillUpdate: function() {
    console.log('is logged in : ' + auth.loggedIn())
  },
  render: function() {
    var self = this;

    var currentSelect = this.props.currentSelection.profile || this.props.currentSelection.component;
    console.log('currentSelect: ' + currentSelect);

    var list = this.state.spaces.map(function(d, sindex){
      var selectedClass = (self.state.currentSpaceIdx == sindex) ? "active" : "";
      return (
        <DropdownButton key={sindex} title={d.label} className={selectedClass} disabled={(d.loginRequired && !auth.loggedIn())}>
          {d.registry.map(function(reg, mindex) { return (
            React.createElement(MenuItem, { key: mindex, onSelect: self.spaceSelect.bind(self, {currentSpaceIdx : sindex, currentRegIdx: mindex}) }, reg.type)
          ) })}
        </DropdownButton>
      );
    });

    // TODO: cleanup button link
    var editorLink = null;
    if(currentSelect != null) {
      var editorRoute = null;
      if(this.props.currentSelection.profile != null)
        editorRoute = "profile";
      else if(this.props.currentSelection.component != null)
        editorRoute = "component";

      if(editorRoute != null)
        editorLink = <ButtonLink to={editorRoute} params={this.props.currentSelection} bsStyle="primary" disabled={this.state.multiSelect || (this.props.currentSelection.profile == null && this.props.currentSelection.component == null)} onClick={this.openViewer}>View Selected</ButtonLink>
    } else
      editorLink = <Button bsStyle="primary" disabled={true}>View Selected</Button>

    return (
      <ButtonGroup className="space_selector">
        {list}
        <Button bsStyle={(this.state.multiSelect) ? "primary" : "info"} onClick={this.toggleSelect}>Toggle Select Mode</Button>
        {editorLink}
      </ButtonGroup>
    );
  }
});

module.exports = SpaceSelector;
