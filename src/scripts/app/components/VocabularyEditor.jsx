'use strict';
var log = require('loglevel');

var React = require('react');

//components
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

var ModalTrigger = require('./ModalTrigger');
var ExternalVocabularySelector = require('./ExternalVocabularySelector');
var ConceptRegistryModal = require('./editor/ConceptRegistryModal');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Input = require('react-bootstrap/lib/Input');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var classNames = require('classnames');
var edit = require('react-edit');
var cloneDeep = require('lodash/lang/cloneDeep');
var findIndex = require('lodash/array/findIndex');
var update = require('react-addons-update');

//services
var ComponentRegistryClient = require('../service/ComponentRegistryClient');

var OPEN_VOCAB = "open";
var CLOSED_VOCAB = "closed";

var VocabularyEditor = React.createClass({
    mixins: [ImmutableRenderMixin],

    propTypes: {
      vocabulary: React.PropTypes.object,
      onVocabularyPropertyChange: React.PropTypes.func.isRequired,
      onRemoveVocabularyItem: React.PropTypes.func.isRequired,
      onAddVocabularyItem: React.PropTypes.func.isRequired,
      onChangeExternalVocab:  React.PropTypes.func.isRequired,
      onOk: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        editedRow: -1,
        editedColumn: -1,
        externalVocabDetailsShown: false,
        selectExternalVocabularyMode: false,
        vocabImport: null
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

    onChangeExternalVocab: function(evt) {
      var target = evt.target;
      if(target.id === 'external-vocab-uri') {
        this.props.onChangeExternalVocab(target.value, this.props.vocabulary && this.props.vocabulary['@ValueProperty'] || null);
      } else if(target.id === 'external-vocab-property') {
        this.props.onChangeExternalVocab(this.props.vocabulary && this.props.vocabulary['@URI'] || null, target.value);
      }
    },

    unsetExternalVocab: function() {
      this.props.onChangeExternalVocab(null, null);
    },

    isClosedVocabulary: function() {
      return this.props.vocabulary && this.props.vocabulary.enumeration != null;
    },

    toggleExternalVocabDetails: function() {
      this.setState({
        externalVocabDetailsShown: !this.state.externalVocabDetailsShown
      })
    },

    doSearchVocabularies: function() {
      this.setState({
        selectExternalVocabularyMode: true
      });
    },

    retrieveVocabItems: function(uri, valueProp, language) {
      log.debug("Retrieving vocabulary items for", uri, valueProp);
      this.setState({
        vocabImport: {
          itemsDownloaded: false,
          itemsCount: -1,
          itemsProcessed: 0
        }
      });
      ComponentRegistryClient.queryVocabularyItems(uri, valueProp, this.processRetrievedVocabItems.bind(this, uri, valueProp, language),
        function(error) {
          this.setState({
            vocabImport: {
              error: error
            }
          });
        }
      );
    },

    processRetrievedVocabItems: function(uri, valueProp, language, data) {
      log.debug("Retrieved vocabulary item", data);

      //async state update, processing of retrieved items
      var defer = $.Deferred(function(def) {
        this.setState({
          vocabImport: {
            itemsDownloaded: true,
            itemsCount: data.length,
            done: false
          }
        });
        def.resolve();
      }.bind(this));

      defer.done(function() {
        var items = data.map(function(item, idx) {
          return {
            '$': item[valueProp + '@' + language],
            'conceptLink': item.uri
          }
        }.bind(this));

        log.debug("Items", items);

        var importState = update(this.state.vocabImport, {$merge: {done: true}});
        this.setState({vocabImport: importState});
      }.bind(this));
    },

    render: function() {
      var enumeration = this.props.vocabulary && this.props.vocabulary.enumeration;
      var vocabType = (this.props.vocabulary == null || this.isClosedVocabulary()) ? CLOSED_VOCAB : OPEN_VOCAB;
      var vocabUri = this.props.vocabulary && this.props.vocabulary['@URI'];
      var vocabValueProp = this.props.vocabulary && this.props.vocabulary['@ValueProperty'];

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

      if(vocabType === CLOSED_VOCAB ) {
        var allowSubmit = vocabData && vocabData.length > 0;
        var allowSubmitMessage = allowSubmit ? "Use the defined closed vocabulary" : "A closed vocabulary should contain at least one item!";
      } else if(vocabType === OPEN_VOCAB) {
        var allowSubmit = vocabUri != null && vocabUri.trim() != '';
        var allowSubmitMessage = allowSubmit ? "Use with the selected external vocabulary " + vocabUri : "An open vocabulary should be linked to an external vocabulary!";
      } else {
        var allowSubmit = false;
        var allowSubmitMessage = "Unknown vocabulary type";
      }

      var tableClasses = classNames('table','table-condensed');
      return (
        <div className="vocabulary-editor">
          <Input type="select" label="Vocabulary type:" value={vocabType} onChange={this.onChangeVocabType}>
            <option value={OPEN_VOCAB}>Open</option>
            <option value={CLOSED_VOCAB}>Closed</option>
          </Input>
          {vocabType === CLOSED_VOCAB &&
            <div className="vocabulary-items">
              Closed vocabulary items:
              <Table.Provider id="typeTable" ref="table" className={tableClasses} columns={this.getColumns()}>
                <Table.Header />
                <Table.Body rows={vocabData} rowKey="rowIdx" />
              </Table.Provider>
              <div className="add-new-vocab"><a onClick={this.props.onAddVocabularyItem}><Glyphicon glyph="plus-sign" />Add an item</a>
              {vocabUri &&
                <span>&nbsp;<a onClick={this.retrieveVocabItems.bind(this, vocabUri, vocabValueProp, 'en')}><Glyphicon glyph="import" />Import/update from the selected external vocabulary</a></span>
              }
              {
                this.state.vocabImport && this.renderVocabularyImport()
              }
              </div>
              {vocabData == null || vocabData.length == 0 &&
                <div className="error">Add one or more items to this vocabulary to make it valid!</div>
              }
            </div>
          }
          {this.renderExternalVocabularyEditor(vocabType, vocabUri, vocabValueProp)}
          <div className="modal-inline"><Button onClick={this.props.onOk} disabled={!allowSubmit} title={allowSubmitMessage}>Use Controlled Vocabulary</Button></div>
        </div>
      );
    },

    renderVocabularyImport: function() {
      var vocabImport = this.state.vocabImport;
      log.trace("Import state", vocabImport);

      var active = !vocabImport.done && !vocabImport.error;

      if(vocabImport.error) {
        var progress = 75;
        var style = "danger";
        var label = "Import failed";
      } else if(vocabImport.done) {
        var progress = 100;
        var style = "success"
        var label = "Done";
      } else if(vocabImport.itemsDownloaded) {
        var progress = 50;
        var style = "info";
        var label = "Processing items..."
      } else {
        var progress = 25;
        var style = null;
        var label ="Getting items..."
      }

      return (
        <div className="vocabulary-import">
          {active ? <ProgressBar active bsStyle={style} label={label} now={Math.floor(progress)} /> : <ProgressBar bsStyle={style} label={label} now={Math.floor(progress)} /> }
          {vocabImport.error && <div className="error">{vocabImport.error}</div>}
        </div>
      );
    },

    renderExternalVocabularyEditor: function(vocabType, vocabUri, vocabValueProp) {
      var modalRef;
      var closeHandler = function(evt) {
        modalRef.toggleModal();
      }

      var isOpen = (vocabType === OPEN_VOCAB);
      var isClosed = (vocabType === CLOSED_VOCAB);

      return (
        <div className="external-vocab-editor">
          {!vocabUri && isOpen &&
            <div className="error">Please select or define an external vocabulary for this open vocabulary!</div>}
          {isClosed &&
            <div><strong>Optionally</strong> select or define an external vocabulary for this closed vocabulary. You can choose to import the items of the selected external vocabulary into the current vocabulary.</div>}
          <div>
            External vocabulary: {vocabUri &&
              <span><a href="">{vocabUri}</a> <a className="remove" onClick={this.unsetExternalVocab} style={{cursor: 'pointer'}}>&#10007;</a></span>
            } {!vocabUri && "none"} &nbsp;
            <ModalTrigger
              ref={function(modal) {
                 modalRef = modal;
               }}
              modalTarget="externalVocabModalContainer"
              label="Search"
              modal={
                  <ExternalVocabularySelector
                    initialSelectionUri={vocabUri}
                    onSelect={this.props.onChangeExternalVocab} onClose={closeHandler} />
              } />
          </div>
          <div>
            <a onClick={this.toggleExternalVocabDetails}>{this.state.externalVocabDetailsShown ? "Hide details":"Show details"}</a>
            {this.state.externalVocabDetailsShown && /* show external vocab details */
              <div className="external-vocab-editor-details">
                <Input id="external-vocab-uri"
                   type="text"
                   label="URI:"
                  value={vocabUri || ""}
                  onChange={this.onChangeExternalVocab} />
                <Input id="external-vocab-property"
                  type="text"
                  label="Value property:"
                  value={vocabValueProp || ""}
                  onChange={this.onChangeExternalVocab} />
              </div>
            }
          </div>
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
                    label="add concept link"
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
