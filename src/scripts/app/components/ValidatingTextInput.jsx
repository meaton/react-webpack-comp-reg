'use strict';

var log = require('loglevel');
var React = require('react/addons');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

var ValidatingTextInput = React.createClass({
  propTypes: {
    validate: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {valid: true};
  },

  render: function() {
    var {validate, className, ...other} = this.props;
    var classes = this.state.valid ? "valid" : "invalid";
    if(className != null) {
      classes += className;
    }
    return <Input className={classes} onBlur={this.validate} {...other} />
  },

  validate: function(evt) {
    var val = evt.target.value;
    var valid = this.props.validate(val, evt);
    log.debug("Validated",val,":",valid);
    this.setState({valid: valid});
  }
});

module.exports = ValidatingTextInput;
