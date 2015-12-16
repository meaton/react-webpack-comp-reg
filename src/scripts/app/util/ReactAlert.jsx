'use strict';
var log = require('loglevel');

var React = require('react');
var ReactDOM = require('react-dom');
var update = require('react-addons-update');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

module.exports = {

  defaultContainer: "alert-container",

  showMessage: function(title, message) {
    log.debug("Alert: [", title, "]", message);

    var renderBodyContent = function() { return (
      <div className="modal-desc">
        <div>{message}</div>
      </div>
    )};

    var renderFooterContent = function(opts) { return (
      <Button onClick={opts.closeAlert}>Ok</Button>
    )};

    this.showModalAlert(title, renderBodyContent, renderFooterContent);
  },

  showConfirmationDialogue: function(title, message, onYes, onNo) {

    var renderBodyContent = function() { return (
      <div className="modal-desc">
        <div>{message}</div>
      </div>
    )};

    var renderFooterContent = function(opts) { return (
      <div>
        <Button onClick={function(evt) {
            opts.closeAlert(evt);
            if(onYes) onYes();
          }}>Yes</Button>
        <Button onClick={function(evt) {
            opts.closeAlert(evt);
            if(onNo) onNo();
          }}>No</Button>
      </div>
    )};

    this.showModalAlert(title, renderBodyContent, renderFooterContent);
  },

  showModalAlert: function(title, renderBodyContent, renderFooterContent, onClose) {
    this.showAlert(function(closeAlert) {
      var opts = {
        closeAlert: function(evt) {
          if(onClose) {
            onClose(evt);
          }
          closeAlert(evt);
        }
      };

      var bodyContent;
      if (typeof renderBodyContent === "function") {
        bodyContent = renderBodyContent(opts);
      } else if (typeof renderBodyContent === "object") {
        bodyContent = renderBodyContent;
      } else {
        bodyContent = null;
      }

      var footerContent;
      if (typeof renderFooterContent === "function") {
        footerContent = renderFooterContent(opts);
      } else if (typeof renderFooterContent === "object") {
        footerContent = renderFooterContent;
      } else {
        footerContent = null;
      }

      return (
        <Modal.Dialog enforceFocus={true} backdrop={true}>
          <Modal.Header closeButton={true} onHide={opts.closeAlert}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          {bodyContent != null && (<Modal.Body>{bodyContent}</Modal.Body>)}
          {footerContent != null && (<Modal.Footer>{footerContent}</Modal.Footer>)}
        </Modal.Dialog>
    )});
  },

  showAlert: function(renderModal, container) {
    if(container == null) {
      container = this.defaultContainer;
    }

    var self = this;
    var closeAlert = function(evt) {
      self.closeAlert(container, evt);
    };

    var dialogue = renderModal(closeAlert);

    this.renderAlert(dialogue, container);

    return dialogue;
  },

  renderAlert: function(instance, elementId) {
    log.debug("Render alert at", elementId, instance);
    var div = React.DOM.div;
    if(instance && elementId)
      ReactDOM.render(div({ className: 'static-modal' }, instance), document.getElementById(elementId));
    else
      log.error('Cannot render Alert dialog: ', elementId);
  },

  closeAlert: function(elementId, evt) {
    if(evt) evt.stopPropagation();
    if(elementId)
      ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
    else
      log.error('Cannot unmount Alert dialog: ', elementId);
  }
}
