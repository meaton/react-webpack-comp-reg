'use strict';
var log = require('loglevel');

var React = require('react');

//components
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

//react
var Button = require('react-bootstrap/lib/Button');

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
      onVocabularyPropertyChange: React.PropTypes.func,
      onOk: React.PropTypes.func
    },

    getInitialState: function() {
      return {
        editedRow: -1,
        editedColumn: -1
      }
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

          self.props.onVocabularyPropertyChange(props.rowData.rowIdx, props.property, props.value);

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
          // cell:
          //   function(v, data, index, prop) {
          //     //make sure that a value is always passed (field for this column is optional)
          //     var value = (v == null) ? "" : v;
          //     var createEditor = editable({editor: editors.input()});
          //     return createEditor(value, data, index, prop);
          //   }
        }, {
          property: '@ConceptLink',
          header: {label: 'Concept link'},
          cell: {
            transforms: [editable(edit.input())]
          }
          // cell: function(value, data, rowIndex) {
          //   var modalRef;
          //   var closeHandler = function(evt) {
          //     modalRef.toggleModal();
          //   }
          //   var modal = (
          //     <ModalTrigger
          //       ref={function(modal) {
          //          modalRef = modal;
          //        }}
          //       modalTarget="ccrModalContainer"
          //       label="add link"
          //       modal={
          //         <ConceptRegistryModal
          //           onClose={closeHandler}
          //           onSelect={self.addConceptLink.bind(self, rowIndex)}
          //           container={this} />
          //       } />
          //   );
          //
          //   return {
          //     value: (value) ?
          //     (<span>
          //       <a href={value} target="_blank">{value}</a> &nbsp;
          //       <a onClick={self.removeConceptLink.bind(self, rowIndex)} style={{cursor: 'pointer'}}>&#10007;</a>
          //     </span>) :
          //     (<span>
          //       {modal}
          //     </span>)
          //   };
          // }.bind(this)
        },
        {
          //TODO
          // cell: function(value, data, rowIndex, property) {
          //   return {
          //       value: (
          //         <span>
          //           <Glyphicon glyph="remove-circle" onClick={self.removeRow.bind(self, rowIndex)} style={{cursor: 'pointer'}} title="Remove item" />
          //         </span>
          //       )
          //   };
          // }
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
          </Table.Provider>
          <div className="modal-inline"><Button onClick={this.props.onOk} disabled={vocabData.length <= 0}>Use Controlled Vocabulary</Button></div>
        </div>
      );
    }

});

module.exports = VocabularyEditor;
