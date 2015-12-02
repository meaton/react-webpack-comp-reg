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
    return {valid: true, validated: false, message: null};
  },

  render: function() {
    var {validate, ...other} = this.props;

    var bsStyle = (this.state.validated && !this.state.valid)?"error":null;

    var input = <Input bsStyle={bsStyle} hasFeedback={true} addonAfter={this.state.message} onBlur={this.validate} {...other} />;
    return input;
  },

  validate: function(evt) {
    var val = evt.target.value;

    // validation method has the option to provide a feedback message
    var msgContainer = { message: null }
    var setMsg = function(message) { msgContainer.message = message; }

    //do validation
    var valid = this.props.validate(val, setMsg, evt.target);

    log.trace("Validated",val,":",valid);
    this.setState({valid: valid, validated: true, message: msgContainer.message});
  }
});

module.exports = ValidatingTextInput;
