'use strict';

var React = require('react/addons');
var Draggable = require('react-draggable');
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

//mixins
var LinkedStateMixin = React.addons.LinkedStateMixin;
var CompRegLoader = require('../mixins/Loader');

//bootstrap mixins
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Button = require('react-bootstrap/lib/Button');
var TabbedArea = require('react-bootstrap/lib/TabbedArea');
var TabPane = require('react-bootstrap/lib/TabPane');


//utils
var update = React.addons.update;
var classNames = require('classnames');

require('../../styles/EditorDialog.sass');

/*
* EditorDialog - generic custom ModalTrigger utilising react-bootstrap OverlayMixin. Used in React components CMD
* @constructor
*/
var EditorDialog = React.createClass({
  render: function() {
    return <ModalTrigger {...this.props} />
  }
});

/*
* TypeModal - Bootstrap Modal dialog used for setting the defined Type value, Pattern value or a custom-defined Vocabulary enum.
* @constructor
* @mixes Loader
* @mixes React.addons.LinkedStateMixin
*/
var TypeModal = React.createClass({
  mixins: [CompRegLoader, LinkedStateMixin],
  getInitialState: function() {
    return {
      basic_type: 'string',
      reg_types: [],
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
      var existingValue = contextItem['ValueScheme'];
      if(contextItem.hasOwnProperty('@ValueScheme'))
        existingValue = contextItem['@ValueScheme'];
      else if(contextItem.hasOwnProperty('Type')) existingValue = contextItem['Type'];

      if(contextItem.ValueScheme != undefined) {
        if(contextItem['ValueScheme'].enumeration != undefined)
          this.setState({ contextItem: contextItem, value: existingValue, currentTabIdx: 1 });
        else if(contextItem['ValueScheme'].pattern != undefined)
          this.setState({ contextItem: contextItem, value: existingValue, currentTabIdx: 2 });
      } else
        this.setState({ contextItem: contextItem, value: existingValue });
    }
  },
  componentDidMount: function() {
    var self = this;
    console.log('value state:' + this.state.value);
    this.loadAllowedTypes(function(data) {
      if(data != null && data.elementType != undefined && $.isArray(data.elementType))
        self.setState({ reg_types: data.elementType }, function() {
          var simpleType = this.refs.simpleTypeInput;
          if(simpleType != undefined)
            simpleType.refs.input.getDOMNode().selectedIndex = (typeof this.state.value === "string") ? $.inArray(this.state.value, data.elementType) : $.inArray("string", data.elementType);
        });
    });

    this.props.onChange(this.getDOMNode());
  },
  addConceptLink: function(rowIndex, newHdlValue) {
    console.log('open concept link dialog: ' + rowIndex, newHdlValue);
    if(this.state.value != null && this.state.value.enumeration != undefined) {
      var newRow = update(this.state.value.enumeration.item[rowIndex], { '@ConceptLink': { $set: newHdlValue } });
      var newValue = update(this.state.value, { enumeration: { item: { $splice: [[rowIndex, 1, newRow]] } } });
      this.setState({ value: newValue });
    }
  },
  addNewRow: function() {
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
  componentDidUpdate: function() {
    this.props.onChange(this.getDOMNode());
  },
  render: function() {
    var self = this;
    var tableClasses = classNames('table','table-condensed');

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
            value: (value) ? (<span><a href={value} target="_blank">{value}</a></span>) : (<span><ModalTrigger type="ConceptRegistry" label="add link" useLink={true} container={self.props.container} target={self} onClose={self.addConceptLink.bind(self, rowIndex)} /></span>)
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
      <Modal ref="modal" id="typeModal" key="typeModal" className="type-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
        <div className='modal-body'>
          <TabbedArea activeKey={this.state.currentTabIdx} onSelect={this.tabSelect}>
            <TabPane eventKey={0} tab="Type">
              <Input ref="simpleTypeInput" linkValue={this.linkState('value')} label="Select type:" type="select" buttonAfter={<Button onClick={this.setSimpleType}>Use Type</Button>}>
              {$.map(this.state.reg_types, function(type, index) {
                return <option key={type}>{type}</option>
              })}
              </Input>
            </TabPane>
            <TabPane eventKey={1} tab="Controlled vocabulary">
              <Table id="typeTable" ref="table" columns={vocabCols} data={vocabData} className={tableClasses}>
                <tfoot>
                  <tr>
                      <td className="info" rowSpan="3" onClick={this.addNewRow}>
                          Click here to add new row.
                      </td>
                      <td></td>
                  </tr>
                </tfoot>
              </Table>
              <div className="modal-inline"><Button onClick={this.setControlVocab} disabled={vocabData.length <= 0}>Use Controlled Vocabulary</Button></div>
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

/*
* ConceptRegistryModal - Bootstrap Modal dialog for setting the Concept Registry (CCR) link.
* @constructor
* @mixes Loader
* @mixes React.addons.LinkedStateMixin
*/
var ConceptRegistryModal = React.createClass({
  mixins: [CompRegLoader, LinkedStateMixin],
  getInitialState: function() {
    return {
      data: [],
      columns: [],
      inputSearch: "",
      currentLinkSelection: null,
    }
  },
  getDefaultProps: function() {
    return {
      title: "Search in CLARIN Concept Registry"
    };
  },
  inputSearchUpdate: function(evt) {
    console.log('search query: ' + this.state.inputSearch);
    var self = this;
    this.setState({ data: [], currentLinkSelection: null });
    this.queryCCR(this.state.inputSearch, function(data) {
      if(data != null)
        self.setState({ data: data });
    });
  },
  handleEnter: function(evt) {
    if(evt.keyCode == 13) {
      console.log('enter: ' + this.state.inputSearch);
      this.inputSearchUpdate();
    }
  },
  confirm: function(evt) {
    var selectedValue = (this.state.currentLinkSelection != null) ? this.state.data[this.state.currentLinkSelection].pid : "";
    this.assignValue(selectedValue);
    this.close();
  },
  clear: function(evt) {
    this.assignValue("");
    this.close();
  },
  close: function(evt) {
    this.props.onRequestHide();
  },
  assignValue: function(value) {
    var target = this.props.target;
    if(target.refs.conceptRegInput != undefined)
      target.refs.conceptRegInput.props.onChange(value);
    else if(target.constructor.displayName === "TypeModal")
      this.props.onClose(value)
  },
  componentDidUpdate: function(prevProps, prevState) {
    if(prevState.currentLinkSelection != this.state.currentLinkSelection) {
      var selectedClass = "selected";
      var tbody = $('#' + this.refs.table.getDOMNode().id + " tbody");
      tbody.children('.' + selectedClass).toggleClass(selectedClass);
      tbody.children().eq(this.state.currentLinkSelection).toggleClass(selectedClass);
    }

    if(prevState.data.length != this.state.data.length)
      this.props.onChange(this.getDOMNode());
  },
  componentWillUnmount: function() {
    $(document.body).off('keydown', this.handleEnter);
  },
  componentWillMount: function() {
    $(document.body).on('keydown', this.handleEnter);

    var defaultClick = this.handleCellClick;
    var defaultProps = this.defaultCellProps;

    this.setState({ columns: [
      {
        property: 'name',
        header: 'Name',
        cell: defaultClick
      },
      {
        property: 'definition',
        header: 'Definition',
        cell: defaultClick
      },
      {
        property: 'identifier',
        header: 'Identifier',
        cell: defaultClick
      },
      {
        property: 'owner',
        header: 'Owner',
        cell: defaultClick
      },
      {
        property: 'pid',
        header: 'PersistentId',
        cell: function(value, data, rowIndex) {
          return {
            value: (value) ? (<span><a href={value} target="_blank">{value}</a></span>) : "",
            props: defaultProps(rowIndex)
          }
        }
      },
      {
        property: 'type',
        header: 'Type',
        cell: this.handleCellClick
      },
      {
        property: 'version',
        header: 'Version',
        cell: this.handleCellClick
      }
    ]});
  },
  componentDidMount: function() {
    this.props.onChange(this.getDOMNode());
  },
  defaultCellProps: function(rowIndex) {
    var self = this;
    var isEven = (rowIndex % 2);

    return {
      onClick: function(evt) {
        self.setState({ currentLinkSelection: rowIndex });
      },
      className: classNames({ odd: !isEven, even: isEven })
    };
  },
  handleCellClick: function(value, data, rowIndex) {
    return {
      value: value,
      props: this.defaultCellProps(rowIndex)
    };
  },
  loadTestdata: function() {
    this.setState({ data: testdata, currentLinkSelection: null });
  },
  render: function() {
    var self = this;
    var tableClasses = classNames('table', 'table-bordered', 'table-hover', 'table-striped', 'table-condensed');
    var conceptRegHeader = {
      onClick: function(col) {
        sortColumn(self.state.columns, col, self.state.data, self.setState.bind(self));
      }
    };

    return (
      <Modal ref="modal" id="ccrModal" key="ccrModal" className="registry-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
        <div className='modal-body'>
          <Input type="text" placeholder="Type keyword and press Enter to search" valueLink={this.linkState('inputSearch')} addonBefore={<Glyphicon glyph='search' />} buttonAfter={<Button onClick={this.inputSearchUpdate}>Search</Button>}/>
          <Table id="ccrTable" ref="table" columns={this.state.columns} data={this.state.data} header={conceptRegHeader} className={tableClasses} />
        </div>
        <div className="modal-footer">
          <Button onClick={this.confirm} disabled={this.state.currentLinkSelection == null}>Ok</Button>
          <Button onClick={this.clear} className={classNames({ 'hide': (this.props.target.refs.conceptRegInput == undefined) })}>Clear Setting</Button>
          <Button onClick={this.close}>Cancel</Button>
        </div>
      </Modal>
    );
  }
});

/*
* ModalTrigger - Bootstrap custom ModalTrigger utilising react-bootstrap OverlayMixin. Manages dialog display for two components implementing Bootstrap Modal, TypeModal and ConceptRegistryModal.
* @constructor
* @mixes OverlayMixin
*/
var ModalTrigger = React.createClass({
  mixins: [OverlayMixin],
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
      },
      container: this.props.container,
      target: (this.props.target == undefined) ? this.props.container : this.props.target
    };
  },
  toggleModal: function(evt) {
      console.log('modal visible: ' + this.state.isModalOpen);

      var offset = $(this.state.container.getDOMNode()).position();
      offset.top += (this.state.container.getDOMNode().className.indexOf("editor") != -1) ? $('.ComponentViewer').offset().top : 0;
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
  componentDidMount: function() {
    console.log('container: ' + this.state.container);
  },
  getModal: function() {
    switch(this.props.type) {
      case "Type":
        return (<TypeModal {...this.props} target={this.state.target} onRequestHide={this.toggleModal} onChange={this.handleTableScroll}/>);
      break;
      case "ConceptRegistry":
        return (<ConceptRegistryModal {...this.props} target={this.state.target} onRequestHide={this.toggleModal} onChange={this.handleTableScroll} />);
      break;
      default:
        return null;
    };
  },
  render: function() {
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
