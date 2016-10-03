'use strict';
var log = require('loglevel');

var React = require('react');

//components
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

var ModalTrigger = require('./ModalTrigger');
var ConceptRegistryModal = require('./editor/ConceptRegistryModal');

//react
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var classNames = require('classnames');
var edit = require('react-edit');
var cloneDeep = require('lodash/lang/cloneDeep');
var findIndex = require('lodash/array/findIndex');

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

    addConceptLink: function(rowIndex, newHdlValue) {
      log.debug('add concept link to row', rowIndex, ":", newHdlValue);
      this.props.onVocabularyPropertyChange(rowIndex, '@ConceptLink', newHdlValue);
    },

    removeConceptLink: function(rowIndex) {
      log.debug("Remove concept link for row", rowIndex);
      this.props.onVocabularyPropertyChange(rowIndex, '@ConceptLink', null);
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

    render: function() {
      var self = this;
      var tableClasses = classNames('table','table-condensed');

      var enumeration = this.props.vocabulary && this.props.vocabulary.enumeration;
      var vocabData = (enumeration != null && enumeration.item != undefined) ? enumeration.item : [];
      if(!$.isArray(vocabData)) {
        // single item, wrap
        vocabData = [vocabData];
      }
      vocabData = vocabData.map(function(val, idx) {
        val.rowIdx = idx;
        return val;
      });

      var editable = edit.edit({
        // Determine whether the current cell is being edited or not.
        isEditing: function(props) {
           return props.columnIndex === self.state.editedColumn && props.rowData.rowIdx === self.state.editedRow
        },

        // The user requested activation, mark the current cell as edited.
        // IMPORTANT! If you stash the rows at this.state.rows, DON'T
        // mutate it as that will break Table.Body optimization check.
        onActivate: function(props) {
          log.trace("activate", props.columnIndex, props.rowData);
          self.setState({
            editedRow: props.rowData.rowIdx,
            editedColumn: props.columnIndex
          });
        },

        // Capture the value when the user has finished and update
        // application state.
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

      var vocabCols = [
        {
          property: '$',
          header: {label: 'Value'},
          cell: {
            transforms: [editable(edit.input())]
          }
        }, {
          property: '@AppInfo',
          header: {label: 'Description'},
          cell: {
            transforms: [editable(edit.input())]
          }
        }, {
          property: '@ConceptLink',
          header: {label: 'Concept link'},
          cell: {
            //transforms: [editable(edit.input())],
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

      log.debug("Table data:", vocabData);

      return (
        <div>
          {/* todo: add row
            <td className="info" rowSpan="3" onClick={this.addNewRow}>
                Click here to add new row.
            </td>
            */}
          <Table.Provider
            id="typeTable" ref="table"
            className={tableClasses}
            columns={vocabCols}
          >
            <Table.Header />

            <Table.Body rows={vocabData} rowKey="$" />

              <tfoot>
              <tr>
                <td colSpan="4"><a onClick={this.props.onAddVocabularyItem}><Glyphicon glyph="plus-sign" />Add an item</a></td>
              </tr>
            </tfoot>
          </Table.Provider>
          <div className="modal-inline"><Button onClick={this.props.onOk} disabled={vocabData.length <= 0}>Use Controlled Vocabulary</Button></div>
        </div>
      );
    }

});

module.exports = VocabularyEditor;
