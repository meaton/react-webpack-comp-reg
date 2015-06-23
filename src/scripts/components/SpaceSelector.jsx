'use strict';

var React = require('react');
var {Route} = require('react-router');

//bootstrap
var ButtonGroup =  require('react-bootstrap/lib/ButtonGroup');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var ButtonLink = require('react-router-bootstrap').ButtonLink;

//utils
var auth = require('./Authentication').auth;
var classNames = require('classnames');

/**
* SpaceSelector - selector or switcher between public, private and/or group spaces and component or profile types.
* @constructor
*/
var SpaceSelector = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    multiSelect: React.PropTypes.shape({
      value: React.PropTypes.bool.isRequired,
      requestChange: React.PropTypes.func.isRequired
    }),
    validUserSession: React.PropTypes.bool
  },
  getInitialState: function() {
    return { currentSpaceIdx: (this.props.filter == "private") ? 1 : 0,
             currentRegIdx: (this.props.type == "components") ? 1 : 0,
             multiSelect: this.props.multiSelect.value,
             spaces: (this.props.type == "componentsOnly") ?
                [{ label: "Public", registry: {type: "Components", filter: "published" }, loginRequired: false },
                 { label: "Private", registry: {type: "Components", filter: "private" }, loginRequired: true }] :
                [{ label: "Public", registry: [{ type: "Profiles", filter: "published" }, { type: "Components", filter: "published" }], loginRequired: false },
                 { label: "Private", registry: [{ type: "Profiles", filter: "private" }, { type: "Components", filter: "private" }], loginRequired: true }]
           };
  },
  spaceSelect: function(nextState, event) {
    console.log('clicked: ' + nextState.currentSpaceIdx);
    console.log('mstate: ' + nextState.currentRegIdx);

    if(this.state.currentSpaceIdx != nextState.currentSpaceIdx || this.state.currentRegIndex != nextState.currentRegIdx) {
      var space = this.state.spaces[nextState.currentSpaceIdx]
      var registryName = ($.isArray(space.registry)) ? space.registry[nextState.currentRegIdx] : space.registry.filter;

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
    if(JSON.stringify(this.props.currentSelection) != JSON.stringify(nextProps.currentSelection))
      this.forceUpdate();
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('is logged in : ' + nextProps.validUserSession);
  },
  render: function() {
    console.log('context loggedIn: ' + this.props.validUserSession);
    var self = this;
    var list = this.state.spaces.map(function(d, sindex){
      var selectedClass = classNames({ active: (self.state.currentSpaceIdx == sindex) });
        if(self.props.type == "componentsOnly")
          return (
            <Button className={selectedClass} disabled={d.loginRequired && !self.props.validUserSession} onClick={self.spaceSelect.bind(self, {currentSpaceIdx: sindex, currentRegIdx: 0})} >
              {d.label}
            </Button>
          );
        else
        return (
          <DropdownButton key={sindex} title={d.label} className={selectedClass} disabled={d.loginRequired && !self.props.validUserSession}>
            {d.registry.map(function(reg, mindex) {
              var selectedTypeClass = classNames({ selected: (selectedClass == "active" && self.state.currentRegIdx == mindex) });
              return (
                React.createElement(MenuItem, { key: mindex, className: selectedTypeClass, onSelect: self.spaceSelect.bind(self, {currentSpaceIdx : sindex, currentRegIdx: mindex}) }, reg.type)
            ) })}
          </DropdownButton>
        );
    });
    var selectModeBtn = <Button bsStyle={(this.state.multiSelect) ? "primary" : "info"} onClick={this.toggleSelect}>Toggle Select Mode</Button>;
    return (this.props.type == "componentsOnly") ?
    (
      <div className="left">
        <ButtonGroup className="space_selector">{list}</ButtonGroup>
      </div>
    ) :
    (
      <div className="left">
        <ButtonGroup className="space_selector">
          {list}
          {selectModeBtn}
        </ButtonGroup>
      </div>
    );
  }
});

module.exports = SpaceSelector;
