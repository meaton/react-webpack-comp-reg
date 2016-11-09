'use strict';

var log = require('loglevel');

var React = require("react");

/**
* ValidationComponentMixin
* Assumes a function 'doValidate'
* @mixin
*/
var ValidatingComponentMixin = {

  getInitialState: function() {
    return {valid: true, validated: false, validationMessage: null};
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

  setValidation: function(valid, message) {
    this.setState({validated: true, valid: valid, validationMessage: message});
  },

  resetValidation: function() {
    this.setState({validated: false, valid: false, validationMessage: null});
  },

  isValidated: function() {
    return this.state.validated;
  },

  isValid: function() {
    return this.state.valid;
  },

  getValidationMessage: function() {
    return this.state.validationMessage;
  }

}

module.exports = ValidatingComponentMixin;
