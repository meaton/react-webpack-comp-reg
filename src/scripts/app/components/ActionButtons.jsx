'use strict';

var React = require('react');

require('../../../styles/ActionButtons.sass'); // TODO apply image styles to links

/**
* ActionButtons - Generates button links displayed inline and used to apply ordering or remove actions to a CMDComponent, CMDElement or CMDAttribute.
* @constructor
*/
var ActionButtons = React.createClass({
  propTypes: {
    onMove: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    moveEnabled: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return { moveEnabled: true }
  },
  render: function() {
    var moveButtons = (this.props.moveEnabled) ? (
      <span className="posControl">
        <a onClick={this.props.onMove.bind(this, "up")}>move up</a>
        <a onClick={this.props.onMove.bind(this, "down")}>move down</a>
      </span>
      ) : null;

    return (
      <div className="controlLinks">
        <a onClick={this.props.onRemove}>click to remove</a>
        {moveButtons}
      </div>
    );
  }

  //old functions below
  // moveHandler: function(direction, evt) {
  //   var target = this.props.target;
  //   if(target.props.moveUp != undefined && direction == "up")
  //     target.props.moveUp();
  //   else if(target.props.moveDown != undefined && direction == "down")
  //     target.props.moveDown();
  // },
  // removeHandler: function(evt) {
  //   var target = this.props.target;
  //   if(target.props.onRemove != undefined)
  //     target.props.onRemove();
  // },
});

module.exports = ActionButtons;
