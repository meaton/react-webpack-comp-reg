'use strict';

var log = require("loglevel");

var React = require("react")

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var ReactAlert = require('../util/ReactAlert');

/**
* ComponentUsageMixin - Feedback for component usage check. Assumes
* a method renderModalContent(errors, doContinue, doAbort)
* @mixin
*/
var ComponentUsageMixin = {
  handleUsageWarning: function(errors, cbYes, cbNo) {
    var errors = this.processUsageErrors(errors);

    if(errors.length >= 1) {
      var doContinue = function(evt) {
        ReactAlert.closeAlert("alert-container", evt);
        cbYes(true);
      }.bind(this);

      var doAbort = function(evt) {
        ReactAlert.closeAlert("alert-container", evt);
        cbNo(true);
      }.bind(this);

      var instance = (
        <Modal title={"Component is used"}
          enforceFocus={true}
          backdrop={true}
          animation={false}
          container={this}
          onRequestHide={ReactAlert.closeAlert.bind(this, "alert-container")}>
          {this.renderUsageModalContent(errors, doContinue, doAbort)}
        </Modal>
      );

      ReactAlert.renderAlert(instance, "alert-container");
    }
  },

  processUsageErrors: function(errors) {
    var li = React.DOM.li;
    var errorsReactDOM = [];

    if(errors != undefined && !$.isArray(errors))
      errors = [errors];

    if(errors != undefined && errors.length > 0)
      for(var i=0; i < errors.length; i++)
        if(errors[i].result != undefined) {
          if(!$.isArray(errors[i].result))
            errors[i].result = [errors[i].result];
          for(var j=0; j < errors[i].result.length; j++) //TODO unique profile names referenced or show profiles used by each matched component
            errorsReactDOM.push(li({ key: errors[i].componentId + "_profile:" + errors[i].result[j].id }, errors[i].result[j].name));
        }

    return errorsReactDOM;
  }

}

module.exports = ComponentUsageMixin;
