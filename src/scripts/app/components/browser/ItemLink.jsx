'use strict';
var log = require('loglevel');

var React = require("react"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

/**
*
*
* @constructor
*/
var ItemLink = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    itemId: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    currentSpace: React.PropTypes.string,
    currentTeam: React.PropTypes.string
  },

  handleClick: function() {
    log.debug("Jumping to", this.props.itemId);
    this.getFlux().actions.jumpToItem(this.props.itemId, this.props.type, this.props.currentSpace, this.props.currentTeam);
  },

  render: function() {
    var {itemId, ...otherProps} = this.props;
    return <a onClick={this.handleClick} {...otherProps}>{this.props.children}</a>
  }
});

module.exports = ItemLink;
