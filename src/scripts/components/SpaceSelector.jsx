/** @jsx React.DOM */

'use strict';

var React = require('react');
var auth = require('./Authentication').auth;

/** Bootstrap components */
var ButtonGroup =  require('react-bootstrap/ButtonGroup');
var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');
var Button = require('react-bootstrap/Button');

var SpaceSelector = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    multiSelect: React.PropTypes.shape({
      value: React.PropTypes.bool.isRequired,
      requestChange: React.PropTypes.func.isRequiredđ
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
  componentWillReceiveProps: function(nextProps) {
    if(this.props.multiSelect.value != nextProps.multiSelect.value)
      this.setState({multiSelect: nextProps.multiSelect.value});
  },
  componentWillUpdate: function() {
    console.log('is logged in : ' + auth.loggedIn())
  },
  render: function() {
    var self = this;

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

    return (
      <ButtonGroup className="space_selector">
        {list}
        <Button bsStyle={(self.state.multiSelect) ? "primary" : "info"} onClick={this.toggleSelect}>Toggle Select Mode</Button>
      </ButtonGroup>
    );
  }
});

module.exports = SpaceSelector;
