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
    moveDownEnabled: React.PropTypes.bool,
    onExpand: React.PropTypes.func,
    onCollapse: React.PropTypes.func,
    isExpanded: React.PropTypes.bool,
    onToggleSelection: React.PropTypes.func,
    isSelected: React.PropTypes.bool
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
        <div className="expandCollaps">
          {this.props.onExpand && !this.props.isExpanded &&
            <a className="expand" onClick={this.props.onExpand}><span className="glyphicon glyphicon-chevron-down"></span></a>
          }
          {this.props.onCollapse && this.props.isExpanded &&
            <a className="expand" onClick={this.props.onCollapse}><span className="glyphicon glyphicon-chevron-up"></span></a>
          }
        </div>
        {this.props.onToggleSelection &&
          <div className="select">
            <a className="toggleSelect" onClick={this.props.onToggleSelection}>{this.props.isSelected ? "unselect" : "select"}</a>
          </div>
        }
        {(this.props.moveUpEnabled || this.props.moveDownEnabled) &&
          <div className="posControl">
            {this.props.moveUpEnabled ? (<a className="moveUp" onClick={this.props.onMove.bind(this, "up")}>move up</a>): <span className="disabledAction">move up</span>}
            {this.props.moveDownEnabled ? (<a className="moveDown" onClick={this.props.onMove.bind(this, "down")}>move down</a>): <span className="disabledAction">move down</span>}
          </div>
        }
        <a className="remove" onClick={this.props.onRemove}>click to remove</a>
      </div>
    );
  }
});

module.exports = ActionButtons;
