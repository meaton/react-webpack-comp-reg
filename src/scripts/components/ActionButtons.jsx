'use strict';

var React = require('react/addons');

//require('../../styles/ActionButtons.sass');

var ActionButtons = React.createClass({
  propTypes: {
    target: React.PropTypes.any.isRequired, // TODO replace with instanceOf check
    moveEnabled: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return { moveEnabled: true }
  },
  moveHandler: function(direction, evt) {
    var target = this.props.target;
    if(target.props.moveUp != undefined && direction == "up")
      target.props.moveUp();
    else if(target.props.moveDown != undefined && direction == "down")
      target.props.moveDown();
  },
  removeHandler: function(evt) {
    var target = this.props.target;
    if(target.props.onRemove != undefined)
      target.props.onRemove();
  },
  render: function() {
    var moveButtons = (this.props.moveEnabled) ? (
      <span className="posControl">
        <a onClick={this.moveHandler.bind(this, "up")}>move up</a>
        <a onClick={this.moveHandler.bind(this, "down")}>move down</a>
      </span>
      ) : null;

    return (
      <div className="controlLinks">
        <a onClick={this.removeHandler}>click to remove</a>
        {moveButtons}
      </div>
    );
  }
});

module.exports = ActionButtons;
