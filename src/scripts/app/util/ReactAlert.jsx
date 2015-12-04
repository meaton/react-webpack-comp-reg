'use strict';

var React = require('react/addons');
var update = React.addons.update;

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

module.exports = {

  renderAlert: function(instance, elementId) {
    var div = React.DOM.div;
    if(instance && elementId)
      React.render(div({ className: 'static-modal' }, instance), document.getElementById(elementId));
    else
      log.error('Cannot render Alert dialog: ', elementId);
  },

  closeAlert: function(elementId, evt) {
    if(evt) evt.stopPropagation();
    if(elementId)
      React.unmountComponentAtNode(document.getElementById(elementId));
    else
      log.error('Cannot unmount Alert dialog: ', elementId);
  },

  showConfirmationDialogue(container, title, message, onYes, onNo) {
    var self = this;
    var closeAlert = function(evt) {
      self.closeAlert("alert-container", evt);
    };

    var dialogue = (
      <Modal title={title}
        enforceFocus={true}
        backdrop={true}
        animation={false}
        container={container}
        onRequestHide={closeAlert}>
        <div className="modal-body">
          <div className="modal-desc">
            <div>{message}</div>
          </div>
        </div>
        <div className="modal-footer">
          <Button onClick={(evt)=>{
              closeAlert(evt);
              if(onYes) onYes();
            }}>Yes</Button>
          <Button onClick={(evt)=>{
              closeAlert(evt);
              if(onNo) onNo();
            }}>No</Button>
        </div>
      </Modal>
    );

    this.renderAlert(dialogue, "alert-container");
  },
}
