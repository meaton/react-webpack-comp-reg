'use strict';

var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var Overlay = require('react-bootstrap/lib/Overlay');

/**
* ButtonModal - Bootstrap Modal dialog triggered by Button, utilising react-bootstrap Overlay to control overlay display.
* @constructor
*/
var ButtonModal = React.createClass({
      getInitialState: function() {
        return {
          isModalOpen: false,
          description: this.props.desc
        };
      },
      getDefaultProps: function() {
        return { disabled: false };
      },
      onConfirm: function(evt) {
        this.toggleModal();
        this.props.action(evt);
      },
      toggleModal: function() {
        this.setState({
          isModalOpen: !this.state.isModalOpen
        });
      },
      componentWillReceiveProps: function(nextProps) {
        this.setState({ description: nextProps.desc });
      },
      render: function() {
        var desc = (typeof this.props.desc === "string") ? ( <p className="modal-desc">{this.state.desc || this.props.desc}</p> ) : this.props.desc;
        return (
          <div>
            <Button disabled={this.props.disabled} onClick={this.toggleModal}>{this.props.btnLabel}</Button>
            {this.renderOverlay(this.state.isModalOpen)}
          </div>
        );
      },
      renderOverlay: function(isShown) {
        var desc = (typeof this.props.desc === "string") ? ( <p className="modal-desc">{this.state.desc || this.props.desc}</p> ) : this.props.desc;
        return (
          <Modal show={isShown} bsStyle="primary" title={this.props.title} animation={false} backdrop={true} onRequestHide={this.toggleModal}>
            <div className="modal-body">
              {desc}
              <div className="modal-footer">
                <Button bsStyle="primary" onClick={this.onConfirm}>OK</Button>
                <Button onClick={this.toggleModal}>Cancel</Button>
              </div>
            </div>
          </Modal>
        );
      }
  });

  module.exports = ButtonModal;
