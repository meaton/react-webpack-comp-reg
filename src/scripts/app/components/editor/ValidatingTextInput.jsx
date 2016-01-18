'use strict';

var log = require('loglevel');

var React = require('react');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

/**
* ValidatingTextInput - bootstrap text input with added dynamic validation capacity
* by means of a validation function that is passed as a required property that
* is evaluated on blur (lost focus). Any validation message provided by that
* function is shown in an input box "addon".
*
* @constructor
*/
var ValidatingTextInput = React.createClass({
  propTypes: {
    validate: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
    //value (any type)
  },

  contextTypes: {
      validationListener: React.PropTypes.object // provided by EditorForm
  },

  getInitialState: function() {
    return {valid: true, validated: false, message: null};
  },

  componentDidMount: function() {
    if(this.context.validationListener != null) {
      this.context.validationListener.add(this);
    }
  },

  componentWillUnmount: function() {
    if(this.context.validationListener != null) {
      this.context.validationListener.remove(this);
    }
  },

  render: function() {
    var {validate, bsStyle, addonAfter, ...other} = this.props;
    var bsStyleOverride = (this.state.validated && !this.state.valid)?"error":bsStyle;
    return <Input ref="input" bsStyle={bsStyleOverride} hasFeedback={true} addonAfter={this.state.message || addonAfter} onBlur={this.onBlur} {...other} />;
  },

  onBlur: function(evt) {
    this.doValidate();
  },

  doValidate: function() {
    var val = this.props.value;

    // validation method has the option to provide a feedback message
    var msgContainer = { message: null }
    var setMsg = function(message) { msgContainer.message = message; }

    //do validation
    var valid = this.props.validate(val, this.props.name, setMsg);

    log.trace("Validated",val,":",valid);
    this.setState({valid: valid, validated: true, message: msgContainer.message});

    return valid;
  }
});

module.exports = ValidatingTextInput;
