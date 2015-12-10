'use strict';

var React = require('react');

require('../../../../styles/ActionButtons.sass'); // TODO apply image styles to links

/**
* ActionButtons - Generates button links displayed inline and used to apply ordering or remove actions to a CMDComponent, CMDElement or CMDAttribute.
* @constructor
*/
var ActionButtons = React.createClass({
  propTypes: {
    onMove: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    moveUpEnabled: React.PropTypes.bool,
    moveDownEnabled: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      moveUpEnabled: true,
      moveDownEnabled: true
    };
  },
  render: function() {
    return (
      <div className="controlLinks">
        <a onClick={this.props.onRemove}>click to remove</a>
        {(this.props.moveUpEnabled || this.props.moveDownEnabled) ?
          (<span className="posControl">
            {this.props.moveUpEnabled ? (<a onClick={this.props.onMove.bind(this, "up")}>move up</a>): <span className="disabledAction">move up</span>}
            {this.props.moveDownEnabled ? (<a onClick={this.props.onMove.bind(this, "down")}>move down</a>): <span className="disabledAction">move down</span>}
          </span>) :null}
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
