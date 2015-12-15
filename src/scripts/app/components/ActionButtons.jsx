'use strict';
var log = require('loglevel');
var React = require('react');

require('../../../styles/ActionButtons.sass'); // TODO apply image styles to links

/**
* ActionButtons - Generates button links displayed inline and used to apply ordering or remove actions to a CMDComponent, CMDElement or CMDAttribute.
* @constructor
*/
var ActionButtons = React.createClass({
  propTypes: {
    onMove: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    moveUpEnabled: React.PropTypes.bool,
    moveDownEnabled: React.PropTypes.bool,
    onToggleExpansion: React.PropTypes.func,
    isExpanded: React.PropTypes.bool,
    onToggleSelection: React.PropTypes.func,
    isSelected: React.PropTypes.bool,
    title: React.PropTypes.object
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
        {this.props.onToggleExpansion && (
          <div className="expandCollapse">
            {!this.props.isExpanded &&
              <a className="expand" onClick={this.props.onToggleExpansion}><span className="glyphicon glyphicon-expand"></span></a>
            }
            {this.props.isExpanded &&
              <a className="expand" onClick={this.props.onToggleExpansion}><span className="glyphicon glyphicon-collapse-up"></span></a>
            }
          </div>
        )}
        {this.props.onToggleSelection &&
          <div className="select">
            <a className="toggleSelect" onClick={this.props.onToggleSelection}>
              {this.props.isSelected ?
                <span title="Unselect" className="glyphicon glyphicon-star"></span>
                :<span title="Select to add other components into this component" className="glyphicon glyphicon-star-empty"></span>
              }
            </a>
          </div>
        }
        <div className="title">
          {this.props.title}
        </div>
        <div className="moveRemove pull-right">
          {this.props.onMove &&
            <div className="posControl">
              {this.props.moveUpEnabled ? (<a title="Move up" onClick={this.props.onMove.bind(this, "up")}><span className="glyphicon glyphicon-circle-arrow-up"></span></a>): <span className="glyphicon glyphicon-circle-arrow-up disabled"></span>}
              {this.props.moveDownEnabled ? (<a title="Move down" onClick={this.props.onMove.bind(this, "down")}><span className="glyphicon glyphicon-circle-arrow-down"></span></a>): <span className="glyphicon glyphicon-circle-arrow-down disabled"></span>}
            </div>
          }
          {this.props.onRemove &&
            <a className="remove" onClick={this.props.onRemove}><span className="glyphicon glyphicon-remove-circle"></span></a>
          }
        </div>
      </div>
    );
  }
});

module.exports = ActionButtons;
