'use strict';

var log = require('loglevel');
var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

/**
* CardinalityInput -
*
* @constructor
*/
var CardinalityInput = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    min: React.PropTypes.string.isRequired,
    max: React.PropTypes.string.isRequired,
    onValueChange: React.PropTypes.func.isRequired,
    maxOccurrencesAllowed: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      maxOccurrencesAllowed: true
    };
  },

  /**
   * Creates an array of values between two bounds
   * @param  {number} min lower bound
   * @param  {number} max upper bound
   * @return {Array}     array with all values from min to max (including bouds)
   */
  integerOpts: function(min, max) {
    return $.map($(Array(1+max-min)), function(item, index) {
      var val = min+index;
      return <option key={val} value={val}>{val}</option>
    });
  },

  render: function() {
    var minC = this.props.min == null ? "1" : this.props.min;
    var maxC = this.props.max == null ? "1" : this.props.max;

    var minUpperBound = maxC == 'unbounded'?10:parseInt(maxC);
    var maxLowerBound = parseInt(minC);

    log.trace("Rendering cardinality input",minC,maxC);

    return(
      <div>
        <Input type="select" name="@CardinalityMin" label="Min Occurrences" value={minC}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.props.onValueChange}>
          {this.integerOpts(0, minUpperBound)}
        </Input>
        <Input type="select" name="@CardinalityMax" label="Max Occurrences" value={maxC} disabled={!this.props.maxOccurrencesAllowed}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.props.onValueChange}>
          {this.integerOpts(maxLowerBound,10)}
          <option value="unbounded">unbounded</option>
        </Input>
      </div>
    );
  }
});

module.exports = CardinalityInput;
