'use strict';
var log = require('loglevel');

var React = require('react');

//components
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

var ModalTrigger = require('./ModalTrigger');
var ConceptRegistryModal = require('./editor/ConceptRegistryModal');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Input = require('react-bootstrap/lib/Input');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var classNames = require('classnames');
var edit = require('react-edit');
var cloneDeep = require('lodash/lang/cloneDeep');
var findIndex = require('lodash/array/findIndex');

var OPEN_VOCAB = "open";
var CLOSED_VOCAB = "closed";

var VocabularyEditor = React.createClass({
    //TODO: add support for open vocabularies (without enum but with @URI and @ValueProperty)
    //        (NB: also support @URI and @ValueProperty for closed vocabularies)

    mixins: [ImmutableRenderMixin],

    propTypes: {
      vocabulary: React.PropTypes.object,
      onVocabularyPropertyChange: React.PropTypes.func.isRequired,
      onRemoveVocabularyItem: React.PropTypes.func.isRequired,
      onAddVocabularyItem: React.PropTypes.func.isRequired,
      onOk: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        editedRow: -1,
        editedColumn: -1
      }
    },

    componentDidMount: function() {
      fixVocabTableColumnSizes();
    },

    componentDidUpdate: function(prevProps, prevState) {
      var vocab = this.props.vocabulary;
      var prevVocab = prevProps.vocabulary;

      if(vocab !== prevVocab) {
        //in case number of items affect scrollbar visibility
        fixVocabTableColumnSizes();

        if(vocab != null && vocab.enumeration !=null && $.isArray(vocab.enumeration.item)) {
          if(prevVocab == null || prevVocab.enumeration == null || vocab.enumeration.item.length > prevVocab.enumeration.item.length) {
            //scroll to bottom
            var tableBody = $('table#typeTable tbody');
            var height = tableBody.prop("scrollHeight");
            log.debug("table height",  height);
            tableBody.animate({scrollTop: height}, "slow");
          }
        }
      }
    },

    addConceptLink: function(rowIndex, newHdlValue) {
      log.debug('add concept link to row', rowIndex, ":", newHdlValue);
      this.props.onVocabularyPropertyChange(rowIndex, '@ConceptLink', newHdlValue);
    },

    removeConceptLink: function(rowIndex) {
      log.debug("Remove concept link for row", rowIndex);
      this.props.onVocabularyPropertyChange(rowIndex, '@ConceptLink', null);
    },

    onChangeVocabType: function(evt) {
      var value = evt.target.value;
      log.debug("Vocab type changed to", value);
      if(value === OPEN_VOCAB) {
        //make open vocabulary.
        //TODO: Warn if items already defined... problem is that ReactAlert modal pops up below the type modal dialogue :(
        this.props.onChangeVocabularyType(OPEN_VOCAB);
      } else {
        //make closed vocabulary
        this.props.onChangeVocabularyType(CLOSED_VOCAB);
      }
    },

    isClosedVocabulary: function() {
      return this.props.vocabulary && this.props.vocabulary.hasOwnProperty("enumeration");
    },

    render: function() {
      var enumeration = this.props.vocabulary && this.props.vocabulary.enumeration;
      var vocabType = this.isClosedVocabulary() ? CLOSED_VOCAB : OPEN_VOCAB;

      var vocabData = (enumeration != null && enumeration.item != undefined) ? enumeration.item : [];
      if(!$.isArray(vocabData)) {
        // single item, wrap
        vocabData = [vocabData];
      }
      vocabData = vocabData.map(function(val, idx) {
        val.rowIdx = idx;
        return val;
      });
      log.trace("Table data:", vocabData);

      var tableClasses = classNames('table','table-condensed');
      return (
        <div>
          <Input type="select" label="Vocabulary type:" value={vocabType} onChange={this.onChangeVocabType}>
            <option value={OPEN_VOCAB}>Open</option>
            <option value={CLOSED_VOCAB}>Closed</option>
          </Input>
          {vocabType === CLOSED_VOCAB &&
            <Table.Provider id="typeTable" ref="table" className={tableClasses} columns={this.getColumns()}>
              <Table.Header />
              <Table.Body rows={vocabData} rowKey="rowIdx" />
            </Table.Provider>
          }
          {vocabType === CLOSED_VOCAB &&
            <div className="add-new-vocab"><a onClick={this.props.onAddVocabularyItem}><Glyphicon glyph="plus-sign" />Add an item</a></div>
          }
          <div className="modal-inline"><Button onClick={this.props.onOk} disabled={vocabType === CLOSED_VOCAB && vocabData.length <= 0}>Use Controlled Vocabulary</Button></div>
        </div>
      );
    },

    getColumns: function() {
      var self = this;
      var editable = edit.edit({
        // Determine whether the current cell is being edited or not.
        isEditing: function(props) {
           return props.columnIndex === self.state.editedColumn && props.rowData.rowIdx === self.state.editedRow
        },

        // The user requested activation...
        onActivate: function(props) {
          log.trace("activate", props.columnIndex, props.rowData);
          self.setState({
            editedRow: props.rowData.rowIdx,
            editedColumn: props.columnIndex
          });
        },

        // Capture the value when the user has finished, propagate change
        onValue: function(props) {
          log.debug("value '", props.value, "' for", props.property, "of", props.rowData);

          var value = props.value;
          if(props.property === '$' || props.property === '@AppInfo') {
            if(value == null) {
              value = ""; //make sure to always set a value
            }
          }

          self.props.onVocabularyPropertyChange(props.rowData.rowIdx, props.property, value);

          //unset edited cell
          self.setState({
            editedRow: -1,
            editedColumn: -1
          });
        }
      });

      var highlightEdited = function(value, extras) {
        if(extras.rowIndex === self.state.editedRow && extras.columnIndex === self.state.editedColumn) {
          return {
            className: "cell-selected"
          };
        }
      };

      return [
        {
          property: '$',
          header: {label: 'Value'},
          cell: {
            transforms: [editable(edit.input()), highlightEdited]
          }
        }, {
          /* Description column */
          property: '@AppInfo',
          header: {label: 'Description'},
          cell: {
            transforms: [editable(edit.input()), highlightEdited]
          }
        }, {
          /* Concept link column */
          property: '@ConceptLink',
          header: {label: 'Concept link'},
          cell: {
            format: function(value, extra){
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
                        onSelect={self.addConceptLink.bind(self, extra.rowIndex)}
                        container={self} />
                    } />
                );

                if(value && value != "") {
                  return (
                    <span>
                      <a href={value} target="_blank">{value}</a> &nbsp;
                      <a onClick={self.removeConceptLink.bind(self, extra.rowIndex)} style={{cursor: 'pointer'}}>&#10007;</a>
                    </span>);
                } else {
                  return (<span>{modal}</span>);
                }
                return <span>click</span>
            }
          }
        },
        {
          /* nameless column with a delete button for each row */
          cell: {
            format: function(value, extra){
              return (<Glyphicon
                        glyph="trash"
                        style={{cursor: 'pointer'}}
                        title="Remove item"
                        onClick={self.props.onRemoveVocabularyItem.bind(null, extra.rowIndex)} />);
            }
          }
        }
      ];
    }

});

module.exports = VocabularyEditor;

function fixVocabTableColumnSizes() {
    // Change the selector if needed
  var $table = $('table#typeTable'),
      $bodyCells = $table.find('tbody tr:first').children(),
      colWidth;

  if($bodyCells && $bodyCells.length > 0) {
    // Get the tbody columns width array
    colWidth = $bodyCells.map(function() {
        return $(this).width();
    }).get();

    // Set the width of thead columns
    $table.find('thead tr').children().each(function(i, v) {
        $(v).width(colWidth[i]);
    });
  }
}
