'use strict';

var React = require('react/addons');
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

//mixins
//var LinkedStateMixin = React.addons.LinkedStateMixin;
//var CompRegLoader = require('../mixins/Loader');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var TabbedArea = require('react-bootstrap/lib/TabbedArea');
var TabPane = require('react-bootstrap/lib/TabPane');


//utils
var update = React.addons.update;
var classNames = require('classnames');

require('../../../styles/EditorDialog.sass');

/**
* TypeModal - Bootstrap Modal dialog used for setting the defined Type value, Pattern value or a custom-defined Vocabulary enum.
* @constructor
* @mixes Loader
* @mixes React.addons.LinkedStateMixin
*/
var TypeModal = React.createClass({
  //mixins: [CompRegLoader, LinkedStateMixin],
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

module.exports = TypeModal;
