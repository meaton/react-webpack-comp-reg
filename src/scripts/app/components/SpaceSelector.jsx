'use strict';

var log = require('loglevel');

var React = require('react');
var {Route} = require('react-router');

var Constants = require("../constants");

//bootstrap
var ButtonGroup =  require('react-bootstrap/lib/ButtonGroup');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var ButtonLink = require('react-router-bootstrap').ButtonLink;

//utils
//var auth = require('./Authentication').auth;
var classNames = require('classnames');

/**
* SpaceSelector - selector or switcher between public, private and/or group spaces and component or profile types.
* @constructor
*/
var SpaceSelector = React.createClass({
  propTypes: {
    space: React.PropTypes.string,
    type: React.PropTypes.string,
    multiSelect: React.PropTypes.bool,
    allowMultiSelect: React.PropTypes.bool,
    validUserSession: React.PropTypes.bool,
    onSpaceSelect: React.PropTypes.func,
    onToggleMultipleSelect: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      allowMultiSelect: true,
      multiSelect: false
    };
  },

  getInitialState: function() {
    return {
             spaces: (this.props.type == "componentsOnly") ?
                [{ label: "Public", registry: {type: Constants.TYPE_COMPONENTS, filter: Constants.SPACE_PUBLISHED }, loginRequired: false },
                 { label: "Private", registry: {type: Constants.TYPE_COMPONENTS, filter: Constants.SPACE_PRIVATE }, loginRequired: true }] :
                [{ label: "Public", registry: [{ type: Constants.TYPE_PROFILE, filter: Constants.SPACE_PUBLISHED }, { type: Constants.TYPE_COMPONENTS, filter: Constants.SPACE_PUBLISHED }], loginRequired: false },
                 { label: "Private", registry: [{ type: Constants.TYPE_PROFILE, filter: Constants.SPACE_PRIVATE }, { type: Constants.TYPE_COMPONENTS, filter: Constants.SPACE_PRIVATE }], loginRequired: true }]
           };
  },

  spaceSelect: function(selection, event) {
    log.trace('clicked type:', selection.currentSpaceIdx);
    log.trace('mstate registry:', selection.currentRegIdx);

    //select 'space-type' object depending on selected index
    var spaceType = this.state.spaces[selection.currentSpaceIdx];
    spaceType = ($.isArray(spaceType.registry))?spaceType.registry[selection.currentRegIdx]:spaceType.registry;

    //private, published, group
    var space = spaceType.filter;
    //profile or components
    var type = spaceType.type;

    log.debug("Selected", space, type);
    this.props.onSpaceSelect(type, space);
  },

  render: function() {
    var currentSpaceIdx = (this.props.space == "private") ? 1 : 0;
    var currentRegIdx = (this.props.type == "components") ? 1 : 0;

    var self = this;
    var list = this.state.spaces.map(function(d, sindex){
      var selectedClass = classNames({ active: (currentSpaceIdx == sindex) });
        if(self.props.type == "componentsOnly") {
          return (
            <Button className={selectedClass} disabled={d.loginRequired && !self.props.validUserSession} onClick={self.spaceSelect.bind(self, {currentSpaceIdx: sindex, currentRegIdx: 0})} >
              {d.label}
            </Button>
          );
        } else {
          return (
            <DropdownButton key={sindex} title={d.label} className={selectedClass} disabled={d.loginRequired && !self.props.validUserSession}>
              {d.registry.map(function(reg, mindex) {
                var selectedTypeClass = classNames({ selected: (selectedClass == "active" && currentRegIdx == mindex) });
                return (
                  React.createElement(MenuItem, { key: mindex, className: selectedTypeClass, onSelect: self.spaceSelect.bind(self, {currentSpaceIdx : sindex, currentRegIdx: mindex}) }, reg.type)
              ) })}
            </DropdownButton>
          );
        }
    });
    var selectModeBtn = this.props.allowMultiSelect ? (
            <Button bsStyle={(this.props.multiSelect) ? "primary" : "info"} 
                    onClick={this.props.onToggleMultipleSelect}>Toggle Select Mode</Button>
          ):null;
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
