'use strict';
var log = require('loglevel');

var React = require('react/addons');
var Draggable = require('react-draggable');
var Overlay = require('react-bootstrap/lib/Overlay');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

//utils
var update = React.addons.update;

/**
* ModalTrigger - Bootstrap custom ModalTrigger utilising react-bootstrap OverlayMixin. Manages dialog display for two components implementing Bootstrap Modal, TypeModal and ConceptRegistryModal.
* @constructor
* @mixes OverlayMixin
*/
var ModalTrigger = React.createClass({
  mixins: [OverlayMixin],
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
      log.trace('modal visible: ', this.state.isModalOpen, this.props.container);

      var offset = $(this.props.container.getDOMNode()).position();
      //TODO: correct offset
      offset.top += (this.props.container.getDOMNode().className.indexOf("editor") != -1) ? $('.ComponentViewer').offset().top : 0;
      log.debug('toggle modal offset:', offset.top, offset.left);

      this.setState({
        position: (!this.state.isModalOpen) ? update(this.state.position, { $set: offset }) : { top: 0, left: 0 },
        isModalOpen: !this.state.isModalOpen
      });
  },
  handleStart: function (event, ui) {
      console.log('Event: ', event);
      console.log('Position: ', ui.position);
  },
  handleDrag: function (event, ui) {
      console.log('Event: ', event);
      console.log('Position: ', ui.position);
      var offset = $(this.state.container.getDOMNode()).position();
      this.setState({
        position: update(this.state.position, { $set: { top: ui.position.top + offset.top, left: ui.position.left + offset.left }})
      });
  },
  handleStop: function (event, ui) {
      console.log('Event: ', event);
      console.log('Position: ', ui.position);
  },
  handleTableScroll: function(domNode) {
    var modal = domNode;
    var tableBody = $(modal).find('.table tbody').eq(0);
    var tableHead = $(modal).find('.table thead').eq(0);
    var scrollbarWidth = tableBody.innerWidth() - tableBody.prop('scrollWidth');

    if(tableBody.innerWidth()-1 > tableBody.prop('scrollWidth')) {
      tableHead.width(tableBody.innerWidth() - scrollbarWidth);
      $(modal).find('.table').addClass('with-scroll');
    } else {
      tableHead.width('100%');
      $(modal).find('.table').removeClass('with-scroll');
    }
  },
  componentDidUpdate: function() {
    var overlayNode = this.getOverlayDOMNode();
    if(overlayNode == undefined) overlayNode = "#"
    $(this.getOverlayDOMNode()).css({left: this.state.position.left, top: this.state.position.top, display: (this.state.isModalOpen) ? 'block' : 'none'});
  },
  render: function() {
    return <div>
      {this.renderTrigger()}
      <Overlay show={this.state.isModalOpen}>{this.renderOverlay}</Overlay>
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
  },
  renderOverlay: function () {
    if(!this.state.isModalOpen) {
      return <span/>;
    } else {
      log.trace("Modal active", this.props.modal);
      return (
        <Draggable axis="both" handle=".modal-header"
          grid={[5, 5]}
          zIndex={1050}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}>
          {this.props.modal}
        </Draggable>
      );
    }
  }
});

module.exports = ModalTrigger;
