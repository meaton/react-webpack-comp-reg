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
    value: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    numberShown: React.PropTypes.number,
    numberTotal: React.PropTypes.number
  },
  render: function() {
    return (
      <div className="gridFilter">
        <Input type="search" value={this.props.value} onChange={this.props.onChange} />
        {this.props.numberShown != null && this.props.numberTotal != null &&
          <span className="filterCount">Showing {this.props.numberShown} of {this.props.numberTotal}</span>
        }
      </div>
    )
  }
});

module.exports = DataGridFilter;
