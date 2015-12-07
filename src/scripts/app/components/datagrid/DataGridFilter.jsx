'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* DataGridFilter
* @constructor
*/
var DataGridFilter = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  render: function() {
    return (
      <div className="gridFilter">
        <Input type="search" value={this.props.value} onChange={this.props.onChange} />
      </div>
    )
  }
});

module.exports = DataGridFilter;
