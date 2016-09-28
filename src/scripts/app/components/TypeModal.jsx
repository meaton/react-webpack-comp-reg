'use strict';
var log = require('loglevel');

var React = require('react');

var Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var ReactDOM = require('react-dom');
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

//mixins
var LinkedStateMixin = require('react-addons-linked-state-mixin');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//components
var ModalTrigger = require('./ModalTrigger');
var ConceptRegistryModal = require('./editor/ConceptRegistryModal');

//service
var ComponentRegistryClient = require('../service/ComponentRegistryClient');
var Validation = require('../service/Validation');

//utils
var update = require('react-addons-update');
var classNames = require('classnames');
var ReactAlert = require('../util/ReactAlert');

require('../../../styles/EditorDialog.sass');

/**
* TypeModal - Bootstrap Modal dialog used for setting the defined Type value, Pattern value or a custom-defined Vocabulary enum.
* @constructor
* @mixes require('react-addons-linked-state-mixin')
*/
var TypeModal = React.createClass({
  //TODO: add support for open vocabularies (without enum but with @URI and @ValueProperty)
  //        (NB: also support @URI and @ValueProperty for closed vocabularies)

  mixins: [LinkedStateMixin,
            FluxMixin, StoreWatchMixin("ValueSchemeStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      valueScheme: flux.store("ValueSchemeStore").getState()
    };
  },

  propTypes: {
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

  componentDidMount: function() {
    log.debug("TypeModal mounted with state", this.state);
    //TODO: set tab depending on current mode
    //this.tabSelect(this.state.valueScheme.type != null ? 0 : this.state.valueScheme.vocabulary != null ? 1 : 2);
    //TODO: keep allowed types in value scheme store
    ComponentRegistryClient.loadAllowedTypes(function(data) {
      if(data != null && data.elementType != undefined && $.isArray(data.elementType))
        this.setState({ reg_types: data.elementType }, function() {
          var simpleType = this.refs.simpleTypeInput;
          if(simpleType != undefined)
            var type = this.state.valueScheme.type;
            ReactDOM.findDOMNode(simpleType.refs.input).selectedIndex = (type != null) ? $.inArray(type, data.elementType) : $.inArray("string", data.elementType);
        });
    }.bind(this));
  },

  tabSelect: function(index) {
    log.trace('tabSelect: ' + index);
    this.setState({ currentTabIdx: index, changedTab: true });
  },

  setSimpleType: function(evt) {
    //TODO: use action
    // var simpleVal = this.refs.simpleTypeInput.getValue();
    // this.props.onChange({type: simpleVal});
    // this.close(evt);
  },

  setPattern: function(evt) {
    //TODO: use action
    // var patternVal = this.refs.patternInput.getValue();
    // this.props.onChange({pattern: patternVal});
    // this.close(evt);
  },

  setControlVocab: function(evt) {
    //TODO: use action
    //TODO: Pass entire Vocabulary object
    // var enumeration = this.state.enumeration;
    // if(enumeration != undefined
    //     && $.isArray(enumeration.item)
    //     && Validation.checkVocabularyItems(enumeration.item, this.showFeedback)) {
    //       //check for duplicate items
    //       this.props.onChange({enumeration: enumeration});
    //       this.close(evt);
    // }
  },

  showFeedback: function(message) {
    alert("Invalid vocabulary: " + message);
  },

  close: function(evt) {
    this.props.onClose(evt);
  },

  addConceptLink: function(rowIndex, newHdlValue) {
    //TODO: use action
    // log.debug('open concept link dialog:', rowIndex, newHdlValue);
    // if(this.state.enumeration != null && this.state.enumeration.item != undefined) {
    //   var items = this.state.enumeration.item;
    //   if(!$.isArray(items)) {
    //     items = [items];
    //   }
    //   var newRow = update(items[rowIndex], { '@ConceptLink': { $set: newHdlValue } });
    //   this.updateConceptLink(rowIndex, newRow);
    // }
  },

  removeConceptLink: function(rowIndex) {
    //TODO: use action
    // if(this.state.enumeration != null && this.state.enumeration.item != undefined) {
    //   var items = this.state.enumeration.item;
    //   if(!$.isArray(items)) {
    //     items = [items];
    //   }
    //   var newRow = update(items[rowIndex], { '@ConceptLink': { $set: null } });
    //   this.updateConceptLink(rowIndex, newRow);
    // }
  },
  updateConceptLink(rowIndex, newRow) {
    //TODO: use action
    // var newEnum;
    // if($.isArray(this.state.enumeration.item)) {
    //   newEnum = update(this.state.enumeration, { item: { $splice: [[rowIndex, 1, newRow]] } });
    // } else {
    //   newEnum = update(this.state.enumeration, { item: {$set: newRow}});
    // }
    // this.setState({ enumeration: newEnum });
  },
  addNewRow: function() {
    //TODO: use action
    // var val = this.state.enumeration;
    // if(val == null)
    //   val = {};
    //
    // var newRow = {'$':'', '@AppInfo':'', '@ConceptLink':''};
    //
    // if(val.item != undefined) {
    //   if($.isArray(val.item)) {
    //     // push new row to array
    //     this.setState({ enumeration: update(val, { item: { $push: [newRow] }}) });
    //   } else {
    //     // turn into array and add new row
    //     this.setState({ enumeration: update(val, {item: {$set: [val.item, newRow]}})});
    //   }
    // } else {
    //   // create new array with one row
    //   this.setState({ enumeration: update(val, { $set: { item: [newRow] }}) });
    // }
  },
  removeRow: function(rowIndex) {
    //TODO: use action
    // log.debug('remove row: ' + rowIndex);
    //
    // if(this.state.enumeration != null && this.state.enumeration.item != null) {
    //   if($.isArray(this.state.enumeration.item)) {
    //     // splice existing array
    //     this.setState({ enumeration: update(this.state.enumeration, { item: { $splice: [[rowIndex, 1]] }}) });
    //   } else if(rowIndex === 0) {
    //     // remove the one (last) item
    //     this.setState({ enumeration: null});
    //   }
    // }
  },

  onSelectType: function(evt) {
    var type = evt.target.value;
    log.debug("select type value", type);
    this.getFlux().actions.updateType(type);
  },

  onChangePattern: function(evt) {
    var pattern = evt.target.value;
    log.debug("update pattern value", pattern);
    this.getFlux().actions.updatePattern(pattern);
  },

  render: function() {

    var patternValue = (this.state.valueScheme.pattern != undefined) ? this.state.valueScheme.pattern : "";
    var typeValue = this.state.valueScheme.type;

    return (
      <Modal.Dialog ref="modal" id="typeModal" key="typeModal" className="type-dialog" enforceFocus={true} backdrop={false}>

        <Modal.Header closeButton={true} onHide={this.close}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs activeKey={this.state.currentTabIdx} onSelect={this.tabSelect}>
            <Tab eventKey={0} title="Type">
              <Input ref="simpleTypeInput" onChange={this.onSelectType} value={typeValue} label="Select type:" type="select" buttonAfter={<Button onClick={this.setSimpleType}>Use Type</Button>}>
              {typeValue == null && <option key="null">-- Select --</option>}
              {$.map(this.state.reg_types, function(type, index) {
                return <option key={type}>{type}</option>
              })}
              </Input>
            </Tab>
            <Tab eventKey={1} title="Controlled vocabulary">
              {this.renderVocabTable()}
            </Tab>
            <Tab eventKey={2} title="Pattern">
              <Input ref="patternInput" type="text" value={patternValue} onChange={this.onChangePattern} label="Enter pattern:" buttonAfter={<Button onClick={this.setPattern}>Use Pattern</Button>} />
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>

      </Modal.Dialog>
    );
  },

  renderVocabTable: function() {
    var self = this;
    var tableClasses = classNames('table','table-condensed');

    var cells = require('reactabular').cells;
    var editors = require('reactabular').editors;
    var editable = cells.edit.bind(this, 'editedCell', function(value, celldata, rowIndex, property) {
        log.debug('row data update: ', value, celldata, rowIndex, property);
        if(value == null) {
          value = "";
        }
        var newData = celldata[rowIndex];
        newData[property] = value;
        var newValue = update(self.state.enumeration, { item: { $splice: [[rowIndex, 1, newData]] } });
        self.setState({ value: newValue });
    });

    var enumeration = this.state.valueScheme.vocabulary && this.state.valueScheme.vocabulary.enumeration;
    var vocabData = (enumeration != null && enumeration.item != undefined) ? enumeration.item : [];
    if(!$.isArray(vocabData)) {
      // single item, wrap
      vocabData = [vocabData];
    }

    var vocabCols = [
      {
        property: '$',
        header: 'Value',
        cell:
          editable({editor: editors.input()})
      }, {
        property: '@AppInfo',
        header: 'Description',
        cell:
          function(v, data, index, prop) {
            //make sure that a value is always passed (field for this column is optional)
            var value = (v == null) ? "" : v;
            var createEditor = editable({editor: editors.input()});
            return createEditor(value, data, index, prop);
          }
      }, {
        property: '@ConceptLink',
        header: 'Concept link',
        cell: function(value, data, rowIndex) {
          var modalRef;
          var closeHandler = function(evt) {
            modalRef.toggleModal();
          }
          var modal = (
            <ModalTrigger
              ref={function(modal) {
                 modalRef = modal;
               }}
              modalTarget="ccrModalContainer"
              label="add link"
              modal={
                <ConceptRegistryModal
                  onClose={closeHandler}
                  onSelect={self.addConceptLink.bind(self, rowIndex)}
                  container={this} />
              } />
          );

          return {
            value: (value) ?
            (<span>
              <a href={value} target="_blank">{value}</a> &nbsp;
              <a onClick={self.removeConceptLink.bind(self, rowIndex)} style={{cursor: 'pointer'}}>&#10007;</a>
            </span>) :
            (<span>
              {modal}
            </span>)
          };
        }.bind(this)
      },
      {
        cell: function(value, data, rowIndex, property) {
          return {
              value: (
                <span>
                  <Glyphicon glyph="remove-circle" onClick={self.removeRow.bind(self, rowIndex)} style={{cursor: 'pointer'}} title="Remove item" />
                </span>
              )
          };
        }
      }
    ];

    log.debug("Table data:", vocabData);

    return (
      <div>
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
      </div>
    );
  }
});

module.exports = TypeModal;
