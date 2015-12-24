'use strict';

var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var Overlay = require('react-bootstrap/lib/Overlay');
var ReactAlert = require('../util/ReactAlert');

/**
* ButtonModal - Bootstrap Modal dialog triggered by Button, utilising react-bootstrap Overlay to control overlay display.
* @constructor
*/
var ButtonModal = React.createClass({
  getDefaultProps: function() {
    return { disabled: false };
  },

  showAlert() {
    var desc = this.props.desc;
    var renderBodyContent = function() {
      if(typeof desc === "string") {
        return (<p className="modal-desc">{desc}</p>);
      } else {
        return desc;
      }
    }.bind(this);

    var action = this.props.action;
    var renderFooterContent = function(opts) {
      return (
        <div>
          <Button bsStyle="primary" onClick={function(evt) {
            action(evt);
            opts.closeAlert(evt);
          }}>OK</Button>
          <Button onClick={opts.closeAlert}>Cancel</Button>
        </div>
      );
    };

    ReactAlert.showModalAlert(this.props.title, renderBodyContent, renderFooterContent
    );
  },

  render: function() {
    return (
        <Button disabled={this.props.disabled} onClick={this.showAlert}>{this.props.btnLabel}</Button>
    );
  }
});

module.exports = ButtonModal;
