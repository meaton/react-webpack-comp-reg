'use strict';
var log = require('loglevel');

var React = require('react');
var ReactDOM = require('react-dom');
// var Draggable = require('react-draggable');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

//utils
var update = require('react-addons-update');
var ReactAlert = require('../util/ReactAlert');

/**
* ModalTrigger - Bootstrap custom ModalTrigger utilising react-bootstrap Overlay. Manages dialog display for two components implementing Bootstrap Modal, TypeModal and ConceptRegistryModal.
* @constructor
*/
var ModalTrigger = React.createClass({
  propTypes: {
    modal: React.PropTypes.object.isRequired,
    label: React.PropTypes.string.isRequired,
    useLink: React.PropTypes.bool,
  },
  getDefaultProps: function() {
    return {
      useLink: false
    }
  },
  getInitialState: function() {
    return {
      isModalOpen: false,
      position: {
        top: 0, left: 0
      }
    };
  },
  toggleModal: function(evt) {
      log.debug('modal visible: ', this.state.isModalOpen, this.props.container);

      // Position of draggable
      // var offset = $(ReactDOM.findDOMNode(this.props.container)).position();
      // //TODO: correct offset
      // offset.top += (ReactDOM.findDOMNode(this.props.container).className.indexOf("editor") != -1) ? $('#app-root').offset().top : 0;
      // log.debug('toggle modal offset:', offset.top, offset.left);
      //
      if(this.state.isModalOpen) {
        //hide
        ReactAlert.closeAlert("editorModal", evt);
      } else {
        //show new alert
        ReactAlert.renderAlert(this.props.modal, "editorModal");
      }

      this.setState({
        // position: (!this.state.isModalOpen) ? update(this.state.position, { $set: offset }) : { top: 0, left: 0 },
        isModalOpen: !this.state.isModalOpen
      });
  },
  render: function() {
    return <div>
      {this.renderTrigger()}
    </div>
  },
  renderTrigger: function() {
    if(this.props.useLink)
      return (
        <a onClick={this.toggleModal}>{this.props.label}</a>
      )
    else
      return (
        <Button onClick={this.toggleModal}>
          {this.props.label}
        </Button>
      );
  }

  // TODO: re-enable dragging?
  // renderOverlay: function () {
  //   return (
  //     <Draggable ref="overlay" axis="both" handle=".modal-header"
  //       grid={[5, 5]}
  //       zIndex={1050}
  //       onStart={this.handleStart}
  //       onDrag={this.handleDrag}
  //       onStop={this.handleStop}>
  //       {this.props.modal}
  //     </Draggable>
  //   );
  // },
  // handleStart: function (event, ui) {
  //     console.log('Event: ', event);
  //     console.log('Position: ', ui.position);
  // },
  // handleDrag: function (event, ui) {
  //     console.log('Event: ', event);
  //     console.log('Position: ', ui.position);
  //     var offset = $(ReactDOM.findDOMNode(this.props.container)).position();
  //     this.setState({
  //       position: update(this.state.position, { $set: { top: ui.position.top + offset.top, left: ui.position.left + offset.left }})
  //     });
  // },
  // handleStop: function (event, ui) {
  //     console.log('Event: ', event);
  //     console.log('Position: ', ui.position);
  // },
  // handleTableScroll: function(domNode) {
  //   var modal = domNode;
  //   var tableBody = $(modal).find('.table tbody').eq(0);
  //   var tableHead = $(modal).find('.table thead').eq(0);
  //   var scrollbarWidth = tableBody.innerWidth() - tableBody.prop('scrollWidth');
  //
  //   if(tableBody.innerWidth()-1 > tableBody.prop('scrollWidth')) {
  //     tableHead.width(tableBody.innerWidth() - scrollbarWidth);
  //     $(modal).find('.table').addClass('with-scroll');
  //   } else {
  //     tableHead.width('100%');
  //     $(modal).find('.table').removeClass('with-scroll');
  //   }
  // },
  // componentDidUpdate: function() {
  //   if(this.refs.overlay != null) {
  //     var overlayNode = ReactDOM.findDOMNode(this.refs.overlay);
  //     if(overlayNode == undefined) overlayNode = "#"
  //     log.debug("Overlay node", overlayNode);
  //     $(overlayNode).css({left: this.state.position.left, top: this.state.position.top, display: (this.state.isModalOpen) ? 'block' : 'none'});
  //   }
  // },
});

module.exports = ModalTrigger;
