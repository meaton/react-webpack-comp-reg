/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');

/** Bootstrap components */
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');

var SpaceSelector = React.createClass({
  getInitialState: function() {
    return { currentSpaceIdx: 0,
             currentRegIdx: 0,
             spaces: [
                { label: "Public", registry: [{ type: "Profiles", filter: "published" }, { type: "Components", filter: "published" }] },
                { label: "Private", registry: [{ type: "Profiles", filter: "private" }, { type: "Components", filter: "private" }] }
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
  render: function() {
    var self = this;

    var list = this.state.spaces.map(function(d, sindex){
      var selectedClass = (self.state.currentSpaceIdx == sindex) ? "active" : "";

      return (
        <DropdownButton title={d.label} className={selectedClass}>
          {d.registry.map(function(reg, mindex) { return (
            <MenuItem eventKey={mindex} onSelect={self.spaceSelect.bind(self, {currentSpaceIdx : sindex, currentRegIdx: mindex})} >{reg.type}</MenuItem>
          ) })}
        </DropdownButton>
      );
    });

    return (
      <ButtonGroup className="space_selector">
        {list}
      </ButtonGroup>
    );
  }
});

module.exports = SpaceSelector;
