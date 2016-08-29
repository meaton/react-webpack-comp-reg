'use strict';
var log = require('loglevel');
var React = require('react');

var Constants = require("../../constants");

//bootstrap
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var MenuItem = require('react-bootstrap/lib/MenuItem');

//utils
var ReactAlert = require('../../util/ReactAlert');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* ComponentStatusSelector
* @constructor
*/
var ComponentStatusSelector = React.createClass({
    mixins: [ImmutableRenderMixin],

    propTypes: {
      item: React.PropTypes.object,
      disabled: React.PropTypes.bool,
      developmentAllowed: React.PropTypes.bool,
      productionAllowed: React.PropTypes.bool,
      deprecatedAllowed: React.PropTypes.bool,
      onStatusChange: React.PropTypes.func
    },

    getDefaultProps: function() {
      return {
        disabled: false,
        developmentAllowed: false,
        productionAllowed: false,
        deprecatedAllowed: false
      };
    },

    createMenuItem: function(status, glyph) {
      var current = (this.props.item != null
          && this.props.item.status != null
          && this.props.item.status.toLowerCase() == status.toLowerCase());
      return (
        <MenuItem key={status} onClick={this.setStatus.bind(this, status)} active={current} disabled={!this.isAllowedStatus(status)}>
          {this.getStatusString(status)}
          <Glyphicon glyph={glyph} bsClass="glyphicon pull-right"/>
        </MenuItem>
      );
    },

    getStatusString: function(status) {
      if(status === Constants.STATUS_DEVELOPMENT) {
        return "Development";
      } else if(status === Constants.STATUS_PRODUCTION) {
        return "Production";
      } else if(status === Constants.STATUS_DEPRECATED) {
        return "Deprecated";
      } else {
        return "???";
      }
    },

    isAllowedStatus: function(status) {
      var currentStatus = (this.props.item == null || this.props.item.status == null) ? null : this.props.item.status.toLowerCase();
      return (
        currentStatus == status.toLowerCase() //keep status, always allowed
          || status == Constants.STATUS_DEVELOPMENT && this.props.developmentAllowed
          || status == Constants.STATUS_PRODUCTION && this.props.productionAllowed
          || status == Constants.STATUS_DEPRECATED && this.props.deprecatedAllowed
      );
    },

    setStatus: function(status) {
      var currentStatus = (this.props.item == null || this.props.item.status == null) ? null : this.props.item.status.toLowerCase();
      if(currentStatus === status.toLowerCase()) {
        // do nothing
      } else {
        this.props.onStatusChange(status);
      }
    },

    render: function() {
      return (
        <DropdownButton id="componentStatus" title="Status" disabled={this.props.disabled}>
          {this.createMenuItem(Constants.STATUS_DEVELOPMENT, Constants.STATUS_ICON_DEVELOPMENT)}
          {this.createMenuItem(Constants.STATUS_PRODUCTION, Constants.STATUS_ICON_PRODUCTION)}
          {this.createMenuItem(Constants.STATUS_DEPRECATED, Constants.STATUS_ICON_DEPRECATED)}
        </DropdownButton>
      );
      }
});

module.exports = ComponentStatusSelector;
