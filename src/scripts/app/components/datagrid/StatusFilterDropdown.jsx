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
    return (
      <Dropdown id="statusFilter" onSelect={this.handleStatusFilter}>
        <Dropdown.Toggle bsStyle={this.props.statusFilter == null ? "default" : "warning"}><Glyphicon glyph="filter" /></Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem eventKey={null} active={this.props.statusFilter == null}>Default</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey={Constants.STATUS_DEVELOPMENT} active={this.props.statusFilter != null && _.contains(this.props.statusFilter, Constants.STATUS_DEVELOPMENT)}><Glyphicon glyph={Constants.STATUS_ICON_DEVELOPMENT}/> Development</MenuItem>
          <MenuItem eventKey="production"><Glyphicon glyph={Constants.STATUS_ICON_PRODUCTION}/> Production</MenuItem>
          <MenuItem eventKey="deprecated"><Glyphicon glyph={Constants.STATUS_ICON_DEPRECATED}/> Deprecated</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
});

module.exports = StatusFilterDropdown;
