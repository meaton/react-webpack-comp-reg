'use strict';
var log = require('loglevel');
var React = require('react');

var Constants = require("../../constants");

//bootstrap
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
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
      moveToTeam: React.PropTypes.func
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
          return (
            <DropdownButton id="moveToTeam" title="Move to team" disabled={this.props.disabled}>
                {this.props.teams.map(function(team) {
                    return (team.id === this.props.selectedTeam) ? null : (
                      <MenuItem
                        key={team.id}
                        onSelect={this.confirmMoveToTeam.bind(this, team.id)}
                        >
                          {team.name}
                      </MenuItem>
                    )
                  }.bind(this)
                )}
            </DropdownButton>
          );
        } else {
          return null;
        }
      }
});

module.exports = MoveToTeamDropdown;
