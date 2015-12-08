'use strict';

var log = require('loglevel');

var React = require('react');

var Constants = require("../../constants");

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var ButtonGroup =  require('react-bootstrap/lib/ButtonGroup');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

//utils
//var auth = require('./Authentication').auth;
var classNames = require('classnames');
var AuthUtil = require('../AuthState').AuthUtil;


var PUBLIC = Constants.SPACE_PUBLISHED;
var PRIVATE = Constants.SPACE_PRIVATE;
var TEAM = Constants.SPACE_TEAM;

var COMPONENTS = Constants.TYPE_COMPONENTS;
var PROFILES = Constants.TYPE_PROFILE;

var TEAM_PREFIX = "group_";

/**
* SpaceSelector - selector or switcher between public, private and/or group spaces and component or profile types.
* @constructor
*/
var SpaceSelector = React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    space: React.PropTypes.string,
    type: React.PropTypes.string,
    componentsOnly: React.PropTypes.bool,
    multiSelect: React.PropTypes.bool,
    allowMultiSelect: React.PropTypes.bool,
    validUserSession: React.PropTypes.bool,
    onSpaceSelect: React.PropTypes.func,
    onToggleMultipleSelect: React.PropTypes.func,
    teams: React.PropTypes.array,
    selectedTeam: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      allowMultiSelect: true,
      multiSelect: false,
      componentsOnly: false,
      teams: [],
      selectedTeam: null
    };
  },

  selectSpace: function(space) {
    var spaceId, teamId;
    if(space == PUBLIC || space == PRIVATE) {
      this.props.onSpaceSelect(this.props.type, space);
    } else if(space.indexOf(TEAM_PREFIX) == 0) {
      var teamId = space.substring(TEAM_PREFIX.length);
      log.debug("Selected team", teamId);
      this.props.onSpaceSelect(this.props.type, TEAM, teamId);
    }
  },

  selectType: function(type) {
    this.props.onSpaceSelect(type, this.props.space, this.props.selectedTeam);
  },

  types: {
    [PROFILES]: {
      label: "Profiles"
    },
    [COMPONENTS]: {
      label: "Components"
    }
  },

  getSpaces: function() {
    var spaces = {
      [PUBLIC]: {
        label: Constants.SPACE_NAMES[PUBLIC],
        loginRequired: false
      },
      [PRIVATE]: {
        label: Constants.SPACE_NAMES[PRIVATE],
        loginRequired: true
      }
    }

    // add group spaces
    if(this.props.teams != null) {
      var teams = this.props.teams;
      for(var i=0;i<(teams.length);i++) {
        log.trace("Group", teams[i]);
        var teamId = TEAM_PREFIX + teams[i].id;
        spaces[teamId] = {
          label: teams[i].name,
          loginRequired: true
        }
      }
    }
    return spaces;
  },

  getCurrentSpace: function() {
    if(this.props.space == PUBLIC || this.props.space == PRIVATE) {
      return this.props.space;
    } else if(this.props.space == Constants.SPACE_TEAM && this.props.selectedTeam != null) {
      return TEAM_PREFIX + this.props.selectedTeam;
    } else {
      return null;
    }
  },

  render: function() {
    var showMultiSelect = this.props.allowMultiSelect;

    var spaces = this.getSpaces();
    var currentSpace = this.getCurrentSpace();

    var types = this.types;
    var currentType = this.props.type;

    return (
      <div className="left">
        <ButtonGroup className="space_selector">

          {/* Public, private, teams */}
          <DropdownButton id="spaceDropDown" title={spaces[currentSpace].label}>
              {(this.props.validUserSession || currentSpace != PUBLIC)?(
                  Object.keys(spaces).map(function(spaceKey) {return (
                    <MenuItem
                      key={spaceKey}
                      className={classNames({ selected: (spaceKey === currentSpace) })}
                      onSelect={this.selectSpace.bind(this, spaceKey)}>
                        {spaces[spaceKey].label}
                    </MenuItem>
                  )}.bind(this)
                )
              ):(
                <MenuItem disabled={true} onSelect={AuthUtil.triggerLogin}>Login to acces other workspaces</MenuItem>
              )
            }
          </DropdownButton>

          {/* Components, profiles */}
          {!this.props.componentsOnly && (
            <DropdownButton id="typeDropDown" title={types[currentType].label}
              disabled={(!this.props.validUserSession && currentSpace != PUBLIC)}>
                {Object.keys(types).map(function(typeKey) {return(
                    <MenuItem
                      key={typeKey}
                      className={classNames({ selected: (typeKey === currentType) })}
                      onSelect={this.selectType.bind(this, typeKey)}>
                        {types[typeKey].label}
                    </MenuItem>
                  )}.bind(this)
                )}
            </DropdownButton>
        )}

          {/* Toggle multiselect */}
          {showMultiSelect && (
            <Button bsStyle={(this.props.multiSelect) ? "primary" : "info"}
                    onClick={this.props.onToggleMultipleSelect}>Toggle Select Mode</Button>
          )}

        </ButtonGroup>
      </div>
    );
  }
});

module.exports = SpaceSelector;
