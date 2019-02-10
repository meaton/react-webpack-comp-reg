'use strict';
var log = require('loglevel');

var React = require('react');
var ReactDOM = require('react-dom');
var update = require('react-addons-update');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

module.exports = {
  defaultContainer: "modal-container",

  showMessage: function(title, message) {
    log.debug("Alert: [", title, "]", message);

    var renderBodyContent = (
      <div className="modal-desc">
        <div>{message}</div>
      </div>
    );

    var renderFooterContent = function(opts) { return (
      <Button onClick={opts.closeAlert}>Ok</Button>
    )};

    this.showModalAlert(title, renderBodyContent, renderFooterContent);
  },

  showConfirmationDialogue: function(title, message, onYes, onNo, yesText, noText) {
    var renderBodyContent = (
      <div className="modal-desc">
        <div>{message}</div>
      </div>
    );

    var renderFooterContent = function(opts) { return (
      <div>
        <Button onClick={function(evt) {
            opts.closeAlert(evt);
            if(onYes) onYes();
          }}>{yesText || 'Yes'}</Button>
        <Button onClick={function(evt) {
            opts.closeAlert(evt);
            if(onNo) onNo();
          }}>{noText || 'No'}</Button>
      </div>
    )};

    this.showModalAlert(title, renderBodyContent, renderFooterContent);
  },

  /**
   * Shows a modal dialogue with the specified content (renderers)
   * @param  {string} title               Title
   * @param  {object|function} renderBodyContent   if a function, called with options {closeAlertHandler}
   * @param  {object|function} [renderFooterContent] if a function, called with options {closeAlertHandler
   * @param  {function} [onClose]             optional callback called before closing the dialogue
   */
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
    log.trace("Render alert at", elementId, instance);
    var div = React.DOM.div;
    if(instance && elementId) {
      log.debug("Rendering alert component at", elementId);
      ReactDOM.render(div({ className: 'static-modal' }, instance), document.getElementById(elementId));
    } else {
      log.error('Cannot render Alert dialog: ', elementId);
    }
  },

  closeAlert: function(elementId, evt) {
    if(evt) evt.stopPropagation();
    if(elementId) {
      log.debug("Unmounting alert component at", elementId);
      ReactDOM.unmountComponentAtNode(document.getElementById(elementId));
    } else {
      log.error('Cannot unmount Alert dialog: ', elementId);
    }
  }
}
