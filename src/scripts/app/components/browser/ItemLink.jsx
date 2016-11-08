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
    var type = this.props.type;
    var id = this.props.itemId;

    log.debug("Jumping to", type, this.props.itemId);

    this.getFlux().actions.jumpToItem(type, id, this.props.currentSpace, this.props.currentTeam);
    this.getFlux().actions.loadItem(type, id);
    this.getFlux().actions.loadComponentSpec(type, id);
  },

  render: function() {
    var {itemId, ...otherProps} = this.props;
    return <a onClick={this.handleClick} {...otherProps}>{this.props.children}</a>
  }
});

module.exports = ItemLink;
