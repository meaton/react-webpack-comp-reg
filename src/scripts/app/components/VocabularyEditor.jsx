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

var VocabularyEditor = React.createClass({
    //TODO: add support for open vocabularies (without enum but with @URI and @ValueProperty)
    //        (NB: also support @URI and @ValueProperty for closed vocabularies)

    mixins: [ImmutableRenderMixin],

    propTypes: {
      vocabulary: React.PropTypes.object,
      onChange: React.PropTypes.func
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

      // var cells = require('reactabular').cells;
      // var editors = require('reactabular').editors;
      // var editable = cells.edit.bind(this, 'editedCell', function(value, celldata, rowIndex, property) {
      //     log.debug('row data update: ', value, celldata, rowIndex, property);
      //     if(value == null) {
      //       value = "";
      //     }
      //     var newData = celldata[rowIndex];
      //     newData[property] = value;
      //     var newValue = update(self.state.enumeration, { item: { $splice: [[rowIndex, 1, newData]] } });
      //     self.setState({ value: newValue });
      // });

      var enumeration = this.props.vocabulary && this.props.vocabulary.enumeration;
      var vocabData = (enumeration != null && enumeration.item != undefined) ? enumeration.item : [];
      if(!$.isArray(vocabData)) {
        // single item, wrap
        vocabData = [vocabData];
      }

      var vocabCols = [
        {
          property: '$',
          header: 'Value',
          // cell:
          //   editable({editor: editors.input()})
        }, {
          property: '@AppInfo',
          header: 'Description',
          // cell:
          //   function(v, data, index, prop) {
          //     //make sure that a value is always passed (field for this column is optional)
          //     var value = (v == null) ? "" : v;
          //     var createEditor = editable({editor: editors.input()});
          //     return createEditor(value, data, index, prop);
          //   }
        }, {
          property: '@ConceptLink',
          header: 'Concept link',
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
          <div className="modal-inline"><Button onClick={this.setControlVocab} disabled={vocabData.length <= 0}>Use Controlled Vocabulary</Button></div>
        </div>
      );
    }

});

module.exports = VocabularyEditor;
