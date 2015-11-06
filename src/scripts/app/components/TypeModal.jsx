'use strict';
var log = require('loglevel');

var React = require('react/addons');
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

//mixins
var LinkedStateMixin = React.addons.LinkedStateMixin;
var ConceptLinkDialogueMixin = require('../mixins/ConceptLinkDialogueMixin')

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var TabbedArea = require('react-bootstrap/lib/TabbedArea');
var TabPane = require('react-bootstrap/lib/TabPane');

//service
var ComponentRegistryClient = require('../service/ComponentRegistryClient');

//utils
var update = React.addons.update;
var classNames = require('classnames');

require('../../../styles/EditorDialog.sass');

/**
* TypeModal - Bootstrap Modal dialog used for setting the defined Type value, Pattern value or a custom-defined Vocabulary enum.
* @constructor
* @mixes React.addons.LinkedStateMixin
*/
var TypeModal = React.createClass({
  mixins: [LinkedStateMixin, ConceptLinkDialogueMixin],
  propTypes: {
    container: React.PropTypes.object.isRequired,
    type: React.PropTypes.string,
    pattern: React.PropTypes.string,
    enumeration: React.PropTypes.object,
    onChange: React.PropTypes.func, //param: object {type/pattern/enumeration}
    onClose: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      reg_types: [],
      currentTabIdx: 0,
      changedTab: false,
      type: null,
      pattern: null,
      enumeration: null
    }
  },
  getDefaultProps: function() {
    return {
      title: "Edit and choose a type"
    };
  },
  tabSelect: function(index) {
    log.trace('tabSelect: ' + index);
    this.setState({ currentTabIdx: index, changedTab: true });
  },
  setSimpleType: function(evt) {
    var simpleVal = this.refs.simpleTypeInput.getValue();
    this.props.onChange({type: simpleVal});
    this.close(evt);
  },
  setPattern: function(evt) {
    var patternVal = this.refs.patternInput.getValue();
    this.props.onChange({pattern: patternVal});
    this.close(evt);
  },
  setControlVocab: function(evt) {
    if(this.state.enumeration != undefined && $.isArray(this.state.enumeration.item)){
      this.props.onChange({enumeration: this.state.enumeration});
    }
    this.close(evt);
  },
  close: function(evt) {
    this.props.onClose(evt);
  },
  componentWillMount: function() {
    log.debug("Setting state to props", this.props);
    this.setState({
      type: this.props.type,
      pattern: this.props.pattern,
      enumeration: this.props.enumeration
    });
    this.tabSelect(this.props.type != null ? 0 : this.props.enumeration != null ? 1 : 2);
  },
  componentDidMount: function() {
    var self = this;
    ComponentRegistryClient.loadAllowedTypes(function(data) {
      if(data != null && data.elementType != undefined && $.isArray(data.elementType))
        self.setState({ reg_types: data.elementType }, function() {
          var simpleType = this.refs.simpleTypeInput;
          if(simpleType != undefined)
            simpleType.refs.input.getDOMNode().selectedIndex = this.state.type != null ? $.inArray(this.state.type, data.elementType) : $.inArray("string", data.elementType);
        });
    });
  },
  addConceptLink: function(rowIndex, newHdlValue) {
    log.debug('open concept link dialog:', rowIndex, newHdlValue);
    if(this.state.enumeration != null && this.state.enumeration.item != undefined) {
      var items = this.state.enumeration.item;
      if(!$.isArray(items)) {
        items = [items];
      }
      var newRow = update(items[rowIndex], { '@ConceptLink': { $set: newHdlValue } });

      var newEnum;
      if($.isArray(this.state.enumeration.item)) {
        newEnum = update(this.state.enumeration, { item: { $splice: [[rowIndex, 1, newRow]] } });
      } else {
        newEnum = update(this.state.enumeration, { item: {$set: newRow}});
      }
      this.setState({ enumeration: newEnum });
    }
  },
  addNewRow: function() {
    var val = this.state.enumeration;
    if(val == null)
      val = {};

    var newRow = {'$':'', '@AppInfo':'', '@ConceptLink':''};

    if(val.item != undefined) {
      if($.isArray(val.item)) {
        // push new row to array
        this.setState({ enumeration: update(val, { item: { $push: [newRow] }}) });
      } else {
        // turn into array and add new row
        this.setState({ enumeration: update(val, {item: {$set: [val.item, newRow]}})});
      }
    } else {
      // create new array with one row
      this.setState({ enumeration: update(val, { $set: { item: [newRow] }}) });
    }
  },
  removeRow: function(rowIndex) {
    console.log('remove row: ' + rowIndex);
    this.setState({ enumeration: update(this.state.enumeration, { item: { $splice: [[rowIndex, 1]] }}) });
  },
  render: function() {
    var self = this;
    var tableClasses = classNames('table','table-condensed');

    var cells = require('reactabular').cells;
    var editors = require('reactabular').editors;
    var editable = cells.edit.bind(this, 'editedCell', function(value, celldata, rowIndex, property) {
        log.trace('row data update: ', value, celldata, rowIndex, property);
        var newData = celldata[rowIndex];
        newData[property] = value;
        var newValue = update(self.state.enumeration, { item: { $splice: [[rowIndex, 1, newData]] } });
        self.setState({ value: newValue });
    });

    var vocabData = (this.state.enumeration != null && this.state.enumeration.item != undefined) ? this.state.enumeration.item : [];
    if(!$.isArray(vocabData)) {
      // single item, wrap
      vocabData = [vocabData];
    }
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
          var modalRef;
          var closeHandler = function(evt) {
            modalRef.toggleModal();
          }
          var modal = self.newConceptLinkDialogueButton(self.addConceptLink.bind(self, rowIndex), closeHandler, "add link", function(modal) {
            modalRef = modal;
          });

          return {
            value: (value) ?
            (<span><a href={value} target="_blank">{value}</a></span>) :
            (<span>
              {modal}
              {/*<ModalTrigger type="ConceptRegistry" label="add link" useLink={true} container={self.props.container} target={self} onClose={self.addConceptLink.bind(self, rowIndex)} />*/}
            </span>)
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

    log.debug("Table data:", vocabData);

    return (
      <Modal ref="modal" id="typeModal" key="typeModal" className="type-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.close} container={this.props.container}>
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
              <Input ref="patternInput" type="text" defaultValue={(this.props.pattern != undefined) ? this.props.pattern : ""} label="Enter pattern:" buttonAfter={<Button onClick={this.setPattern}>Use Pattern</Button>} />
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
