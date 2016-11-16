'use strict';
var log = require('loglevel');
var React = require('react');

var Constants = require("../../constants");

//bootstrap
var Dropdown = require('react-bootstrap/lib/Dropdown');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//utils
var ReactAlert = require('../../util/ReactAlert');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* MoveToTeamDropdown
* @constructor
*/
var MoveToTeamDropdown = React.createClass({
    mixins: [ImmutableRenderMixin],

    propTypes: {
      space: React.PropTypes.string.isRequired,
      teams: React.PropTypes.array,
      disabled: React.PropTypes.bool,
      moveToTeam: React.PropTypes.func,
      selectedTeam: React.PropTypes.string,
      title: React.PropTypes.string,
      glyph: React.PropTypes.string
    },

    confirmMoveToTeam: function(teamId) {
      if(this.props.space != Constants.SPACE_PRIVATE) {
        this.props.moveToTeam(teamId);
      } else {
        // moving out of private space cannot be undone, show warning
        var title = "Move component(s) or profile(s) into team space";
        var message = "Items, once moved to a team space, can not be moved back to your workspace. Do you want to move this item?";
        ReactAlert.showConfirmationDialogue(title, message, this.props.moveToTeam.bind(null, teamId));
      }
    },

    render: function() {
        if($.isArray(this.props.teams) && this.props.teams.length > 0) {
          log.trace("Move to team dropdown", this.props.teams, "current team", this.props.selectedTeam);
          return (
            <Dropdown id="moveToTeam">
              <Dropdown.Toggle disabled={this.props.disabled} title="Move the selected item(s) to a team">
                {this.props.glyph && <Glyphicon glyph={this.props.glyph}/>} {this.props.title}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {this.props.teams.map(function(team) {
                    return (team.id === this.props.selectedTeam) ? null : (
                      <MenuItem
                        key={team.id}
                        onSelect={this.confirmMoveToTeam.bind(this, team.id)}
                        >
                          <Glyphicon glyph={Constants.SPACE_ICONS[Constants.SPACE_TEAM]} /> {team.name}
                      </MenuItem>
                    )
                  }.bind(this)
                )}
              </Dropdown.Menu>
            </Dropdown>
          );
        } else {
          return null;
        }
      }
});

module.exports = MoveToTeamDropdown;
