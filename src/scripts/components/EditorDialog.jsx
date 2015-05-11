'use strict';

var React = require('react/addons');
var update = React.addons.update;

var Draggable = require('react-draggable');
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');
var Button = require('react-bootstrap/lib/Button');
var TabbedArea = require('react-bootstrap/lib/TabbedArea');
var TabPane = require('react-bootstrap/lib/TabPane');

require('../../styles/EditorDialog.sass');

var EditorDialog = React.createClass({
  render: function() {
    return <ModalTrigger {...this.props} />
  }
});

var TypeModal = React.createClass({
  getInitialState: function() {
    return {
      basic_type: 'string',
      pattern: null,
      vocab: null,
      currentTabIdx: 0
    }
  },
  getDefaultProps: function() {
    return {
      title: "Edit and choose a type"
    };
  },
  tabSelect: function(index) {
    console.log('tabSelect: ' + index);
    this.setState({ currentTabIdx: index });
  },
  setSimpleType: function(evt) {
    this.props.target.refs.typeInput.props.onChange("@ValueScheme", this.refs.simpleTypeInput.getValue());
  },
  setPattern: function(evt) {
    this.props.target.refs.typeInput.props.onChange("pattern", this.refs.patternInput.getValue());
  },
  cancel: function(evt) {
    evt.stopPropagation();
    this.props.onRequestHide();
  },
  render: function() {
    return (
      <Modal id="myModal" className="type-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
        <div className='modal-body'>
          <TabbedArea activeKey={this.state.currentTabIdx} onSelect={this.tabSelect}>
            <TabPane eventKey={0} tab="Type">
              <Input ref="simpleTypeInput" label="Select type:" type="select" buttonAfter={<Button onClick={this.setSimpleType}>Use Type</Button>}>
              {$.map(['boolean', 'decimal', 'float'], function(type, index) {
                return <option key={index}>{type}</option>
              })}
              </Input>
            </TabPane>
            <TabPane eventKey={1} tab="Controlled vocabulary">
            </TabPane>
            <TabPane eventKey={2} tab="Pattern">
              <Input type="text" defaultValue="" label="Enter pattern:" buttonAfter={<Button onClick={this.setPattern}>Use Pattern</Button>} />
            </TabPane>
          </TabbedArea>
        </div>
        <div className="modal-footer">
          <Button onClick={this.cancel}>Cancel</Button>
        </div>
      </Modal>
    );
  }
});

var ConceptRegistryModal = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      inputSearch: "",
      currentLinkSelection: null
    }
  },
  getDefaultProps: function() {
    return {
      title: "Search in CLARIN Concept Registry"
    };
  },
  inputSearchUpdate: function(evt) {
    console.log('search query: ' + this.state.inputSearch);
  },
  confirm: function(evt) {
    var target = this.props.target;

    var selectedValue = "hdl://" //TODO use current selected table item HDL value
    target.refs.conceptRegInput.props.onChange(selectedValue);
    
    this.props.onRequestHide();
  },
  cancel: function(evt) {
    this.props.onRequestHide();
  },
  render: function() {
      return (
        <Modal id="myModal" className="registry-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
          <div className='modal-body'>
            <Input type="text" placeholder="Type keyword and press Enter to search" valueLink={this.linkState('inputSearch')} addonBefore={<Glyphicon glyph='search' />} buttonAfter={<Button onClick={this.inputSearchUpdate}>Search</Button>}/>
          </div>
          <div className="modal-footer">
            <Button onClick={this.confirm}>Ok</Button><Button onClick={this.cancel}>Cancel</Button>
          </div>
        </Modal>
      );
  }
});

var ModalTrigger = React.createClass({
  mixins: [OverlayMixin],
  getInitialState: function() {
    return {
      isModalOpen: false,
      position: {
        top: 0, left: 0
      },
      container: this.props.container,
      target: (this.props.target == undefined) ? this.props.container : this.props.target
    };
  },
  toggleModal: function(evt) {
      console.log('hide modal');

      var offset = $(this.state.container.getDOMNode()).position();
      console.log('toggle modal offset: ' + offset.top + " " + offset.left);

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
  componentDidUpdate: function() {
    $('#myModal').css({left: this.state.position.left, top: this.state.position.top, display: (this.state.isModalOpen) ? 'block' : 'none'});
  },
  componentDidMount: function() {
    console.log('container: ' + this.state.container);
  },
  getModal: function() {
    switch(this.props.type) {
      case "Type":
        return (<TypeModal {...this.props} target={this.state.target} onRequestHide={this.toggleModal}/>);
      break;
      case "ConceptRegistry":
        return (<ConceptRegistryModal {...this.props} target={this.state.target} onRequestHide={this.toggleModal}/>);
      break;
      default:
        return null;
    };
  },
  render: function() {
    return (
      <Button onClick={this.toggleModal}>
        {this.props.buttonLabel}
      </Button>
    );
  },
  renderOverlay: function () {
    if(!this.state.isModalOpen)
      return <span/>;

    var modal = this.getModal();
    console.log('render overlay: ' + this.props.type);

    var target = this.state.target;
    console.log('target: ' + target);

    return (
      <Draggable axis="both" handle=".modal-header"
        grid={[5, 5]}
        zIndex={1050}
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        {modal}
      </Draggable>
    );
  }
});

module.exports = EditorDialog;
