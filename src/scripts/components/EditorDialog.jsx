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

var Table = require('reactabular').Table;
var classNames = require('classnames');

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
      currentTabIdx: 0,
      changedTab: false,
      contextItem: null,
      value: null
    }
  },
  getDefaultProps: function() {
    return {
      title: "Edit and choose a type"
    };
  },
  tabSelect: function(index) {
    console.log('tabSelect: ' + index);
    this.setState({ currentTabIdx: index, changedTab: true });
  },
  setSimpleType: function(evt) {
    var target = this.props.target;
    var typeInput = target.refs.typeInput;
    var simpleVal = this.refs.simpleTypeInput.getValue();

    if(target.state.attr != undefined)
      typeInput.props.onChange("Type", simpleVal);
    else if(target.state.elem != undefined)
      typeInput.props.onChange("@ValueScheme", simpleVal);

    this.close();
  },
  setPattern: function(evt) {
    this.props.target.refs.typeInput.props.onChange("pattern", this.refs.patternInput.getValue());
    this.close();
  },
  setControlVocab: function(evt) {
    if(this.state.value.enumeration != undefined && $.isArray(this.state.value.enumeration.item))
      this.props.target.refs.typeInput.props.onChange("enumeration", this.state.value.enumeration);
    this.close();
  },
  close: function(evt) {
    this.props.onRequestHide();
  },
  componentWillMount: function() {
    var contextItem = null;
    var state = this.props.target.state;
    if(state.attr != undefined)
      contextItem = state.attr;
    else if(state.elem != undefined)
      contextItem = state.elem;

    if(contextItem != null) {
      var existingValue = (contextItem.hasOwnProperty('@ValueScheme') || contextItem.hasOwnProperty('Type')) ?
                            contextItem['@ValueScheme']||contextItem['Type'] :
                            contextItem['ValueScheme'];
      if(contextItem.ValueScheme != undefined) {
        if(contextItem['ValueScheme'].enumeration != undefined)
          this.setState({ contextItem: contextItem, value: existingValue, currentTabIdx: 1 });
        else if(contextItem['ValueScheme'].pattern != undefined)
          this.setState({ contextItem: contextItem, value: existingValue, currentTabIdx: 2 });
      } else
        this.setState({ contextItem: contextItem, value: existingValue });
    }
  },
  addConceptLink: function(rowIndex) {
    //TODO open concept link dialog on top of type dialog
    console.log('open concept link dialog: ' + rowIndex);
  },
  addNewRow: function() {
    console.log('add new row test');
    var val = this.state.value;
    if(val.enumeration == undefined)
      if(typeof val === "string" || val.pattern != undefined)
        val = { enumeration: "" };

    if(val.enumeration.item != undefined)
      this.setState({ value: update(val, { enumeration: { item: { $push: [{'$':'', '@AppInfo':'', '@ConceptLink':''}] }}}) });
    else
      this.setState({ value: update(val, { enumeration: { $set: { item: [{'$':'', '@AppInfo':'', '@ConceptLink':''}] }}}) });
  },
  removeRow: function(rowIndex) {
    console.log('remove row: ' + rowIndex);
    this.setState({ value: update(this.state.value, { enumeration: { item: { $splice: [[rowIndex, 1]] }}}) });
  },
  handleTableScroll: function() {
    var tableBody = $('#myModal .table tbody');
    var tableHead = $('#myModal .table thead th');
    var scrollbarWidth = tableBody.innerWidth() - tableBody.prop('scrollWidth');
    if(tableBody.innerWidth() > tableBody.prop('scrollWidth')) {
      tableHead.each(function(index, elem) {
        var elemWidth = $(elem).width();
        if(index < 3 && !$(elem).attr('style'))
          $(elem).width(elemWidth - (scrollbarWidth / 3));
      });
    } else {
      tableHead.each(function(index, elem) {
        $(elem).css("width", "");
      });
    }
  },
  componentDidMount: function() {
    this.handleTableScroll();
  },
  componentDidUpdate: function() {
    this.handleTableScroll();
  },
  render: function() {
    var self = this;
    var tableClasses = classNames('table', 'table-stripped', 'table-condensed');

    var cells = require('reactabular').cells;
    var editors = require('reactabular').editors;
    var editable = cells.edit.bind(this, 'editedCell', function(value, celldata, rowIndex, property) {
        console.log('row data update: ' + value, celldata, rowIndex, property);
        var newData = celldata[rowIndex];
        newData[property] = value;
        var newValue = update(self.state.value, { enumeration: { item: { $splice: [[rowIndex, 1, newData]] }} });
        self.setState({ value: newValue });
    });

    var vocabData = (this.state.value.hasOwnProperty('enumeration')) ? this.state.value.enumeration.item : [];
    var vocabCols = [
      {
        property: '$',
        header: 'Value',
        cell: [
          editable({editor: editors.input()})
        ]
      }, {
        property: '@AppInfo',
        header: 'Description',
        cell: [
          editable({editor: editors.input()})
        ]
      }, {
        property: '@ConceptLink',
        header: 'Concept link',
        cell: function(value, data, rowIndex) {
          return {
            value: (value) ? value : (<span><a className="addConceptLink" onClick={self.addConceptLink.bind(self, rowIndex)}>add link</a></span>),
            props: {
              onClick: self.addConceptLink.bind(self, rowIndex)
            }
          };
        }
      },
      {
        cell: function(value, data, rowIndex, property) {
          return {
              value: (
                <span>
                  <span onClick={self.removeRow.bind(self, rowIndex)} style={{cursor: 'pointer'}}>&#10007;</span>
                </span>
              )
          };
        }
      }
    ];

    return (
      <Modal id="myModal" className="type-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
        <div className='modal-body'>
          <TabbedArea activeKey={this.state.currentTabIdx} onSelect={this.tabSelect}>
            <TabPane eventKey={0} tab="Type">
              <Input ref="simpleTypeInput" defaultValue={(this.state.contextItem.hasOwnProperty('@ValueScheme') || this.state.contextItem.hasOwnProperty('Type')) ? this.state.value : "string"} label="Select type:" type="select" buttonAfter={<Button onClick={this.setSimpleType}>Use Type</Button>}>
              {$.map(['boolean', 'decimal', 'float', 'int', 'string', 'anyURI', 'date', 'gDay', 'gMonth', 'gYear', 'time', 'dateTime'], function(type, index) {
                return <option key={index}>{type}</option>
              })}
              </Input>
            </TabPane>
            <TabPane eventKey={1} tab="Controlled vocabulary">
              <Table columns={vocabCols} data={vocabData} className={tableClasses}>
                <tfoot>
                  <tr>
                      <td className="table-row-clickable" onClick={this.addNewRow}>
                          Click here to add new row.
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                  </tr>
                </tfoot>
              </Table>
              <div className="modal-inline"><Button onClick={this.setControlVocab}>Use Controlled Vocabulary</Button></div>
            </TabPane>
            <TabPane eventKey={2} tab="Pattern">
              <Input ref="patternInput" type="text" defaultValue={(this.state.contextItem.hasOwnProperty('ValueScheme') && this.state.contextItem.ValueScheme.pattern != undefined) ? this.state.value.pattern : ""} label="Enter pattern:" buttonAfter={<Button onClick={this.setPattern}>Use Pattern</Button>} />
            </TabPane>
          </TabbedArea>
        </div>
        <div className="modal-footer">
          <Button onClick={this.close}>Cancel</Button>
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
      currentLinkSelection: null,
      value: "http://hdl.handle.net/11459/CCR_C-1227_0eec90a9-a0f2-1240-a9b6-9bfd76654a2e"
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

    var selectedValue = this.state.value; //TODO use current selected table item HDL value
    target.refs.conceptRegInput.props.onChange(selectedValue);

    this.close();
  },
  close: function(evt) {
    this.props.onRequestHide();
  },
  render: function() {
      return (
        <Modal id="myModal" className="registry-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
          <div className='modal-body'>
            <Input type="text" placeholder="Type keyword and press Enter to search" valueLink={this.linkState('inputSearch')} addonBefore={<Glyphicon glyph='search' />} buttonAfter={<Button onClick={this.inputSearchUpdate}>Search</Button>}/>
          </div>
          <div className="modal-footer">
            <Button onClick={this.confirm}>Ok (Test)</Button><Button onClick={this.close}>Cancel</Button>
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
