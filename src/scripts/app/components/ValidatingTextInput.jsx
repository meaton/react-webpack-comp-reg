'use strict';

var log = require('loglevel');

var React = require('react/addons');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

var ValidatingTextInput = React.createClass({
  propTypes: {
    validate: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired
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
    var {validate, ...other} = this.props;
    var bsStyle = (this.state.validated && !this.state.valid)?"error":null;
    return <Input ref="input" bsStyle={bsStyle} hasFeedback={true} addonAfter={this.state.message} onBlur={this.handleBlur} {...other} />;
  },

  handleBlur: function(evt) {
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
