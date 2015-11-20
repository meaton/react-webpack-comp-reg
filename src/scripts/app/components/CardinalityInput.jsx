'use strict';

var log = require('loglevel');
var React = require('react/addons');

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
    min: React.PropTypes.number.isRequired,
    max: React.PropTypes.number.isRequired,
    onValueChange: React.PropTypes.func.isRequired,
    maxOccurrencesAllowed: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      maxOccurrencesAllowed: true
    };
  },

  render: function() {
    var minC = this.props.min == null ? 1 : this.props.min;
    var maxC = this.props.max == null ? 1 : this.props.max;

    //TODO: replace options with discrete value selector (like display priority)
    var integerOpts = $.map($(Array(10)), function(item, index) {
      return <option key={index} value={index}>{index}</option>
    });

    log.debug("Rendering cardinality input",minC,maxC);

    return(
      <div>
        <Input type="select" name="@CardinalityMin" label="Min Occurrences" value={minC}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.props.onValueChange}>
          {integerOpts /*TODO: max @CardinalityMax*/}
        </Input>
        <Input type="select" name="@CardinalityMax" label="Max Occurrences" value={maxC} disabled={!this.props.maxOccurrencesAllowed}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.props.onValueChange}>
          {integerOpts /*TODO: min @CardinalityMin*/}
          <option value="unbounded">unbounded</option>
        </Input>
      </div>
    );
  }
});

module.exports = CardinalityInput;
