'use strict';
var log = require('loglevel');
var React = require('react');

var Constants = require("../../constants");

//bootstrap
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
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
      disabled: React.PropTypes.bool
    },

    getDefaultProps: function() {
      return {
        disabled: false
      };
    },

    createMenuItem: function(status) {
      var current = (this.props.item != null
          && this.props.item.status != null
          && this.props.item.status.toLowerCase() == status.toLowerCase());
      return (
        <MenuItem key={status} onClick={this.setStatus.bind(this, status)} active={current}>
          {this.getStatusString(status)}
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

    setStatus: function(status) {
      log.debug('set status', status);
    },

    render: function() {
      return (
        <DropdownButton id="componentStatus" title="Status" disabled={this.props.disabled}>
          {this.createMenuItem(Constants.STATUS_DEVELOPMENT)}
          {this.createMenuItem(Constants.STATUS_PRODUCTION)}
          {this.createMenuItem(Constants.STATUS_DEPRECATED)}
        </DropdownButton>
      );
      }
});

module.exports = ComponentStatusSelector;
