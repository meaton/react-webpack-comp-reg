'use strict';
var log = require('loglevel');

var React = require('react');

var Constants = require("../../constants");

var _ = require('lodash');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Dropdown = require('react-bootstrap/lib/Dropdown');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');


/**
* SpaceSelector - selector or switcher between public, private and/or group spaces and component or profile types.
* @constructor
*/
var StatusFilterDropdown = React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    statusFilter: React.PropTypes.array,
    onStatusFilterReset:  React.PropTypes.func,
    onStatusFilterToggle:  React.PropTypes.func
  },

  handleStatusFilter: function(event, status) {
    log.debug("Filter select", status);
    if(status == null) {
      this.props.onStatusFilterReset();
    } else {
      this.props.onStatusFilterToggle(status);
    }
  },

  render: function() {
    var statusFilter = this.props.statusFilter;
    return (
      <Dropdown id="statusFilter" onSelect={this.handleStatusFilter}>
        <Dropdown.Toggle bsStyle={statusFilter == null ? "default" : "warning"}><Glyphicon glyph="filter" /></Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem eventKey={null} active={statusFilter == null}>Default</MenuItem>
          <MenuItem divider />
          {this.createStatusItem(Constants.STATUS_DEVELOPMENT, "Development", Constants.STATUS_ICON_DEVELOPMENT)}
          {this.createStatusItem(Constants.STATUS_PRODUCTION, "Production", Constants.STATUS_ICON_PRODUCTION)}
          {this.createStatusItem(Constants.STATUS_DEPRECATED, "Deprecated", Constants.STATUS_ICON_DEPRECATED)}
        </Dropdown.Menu>
      </Dropdown>
    );
  },

  createStatusItem: function(status, name, icon) {
    return (
      <MenuItem
        eventKey={status}
        active={this.props.statusFilter != null && _.contains(this.props.statusFilter, status)}>
        <Glyphicon glyph={icon}/> {name}
      </MenuItem>
    );
  }
});

module.exports = StatusFilterDropdown;
