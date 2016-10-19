'use strict';
var log = require('loglevel');

var React = require('react');
var update = require('react-addons-update');

//components
var ModalTrigger = require('../ModalTrigger');

//bootstrap
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

//utils
var update = require('react-addons-update');

var languageCodes = {
  eng: "English",
  deu: "German",
  nld: "Dutch"
};

/**
* ConceptLinkInput - Text input with button to trigger CCR search
*
* @constructor
*/
var DocumentationInput = React.createClass({
  propTypes: {
    value: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  updateValue: function(index, evt) {
    var newValue = evt.target.value;
    var doc = this.props.value;
    if(doc == null || !$.isArray(doc) || doc.length == 0) {
      //no documentation set yet - make a new array
      this.props.onChange([{'$': newValue}]);
    } else {
      var currentDoc = doc[index];
      var newDoc = {'$': newValue};
      if(currentDoc != null) {
        var newDoc = update(currentDoc, {$merge: newDoc});
      }
      this.props.onChange(update(doc, {$splice: [[index, 1, newDoc]]}));
    }
  },

  updateLanguageCode: function(index, languageCode) {
    log.debug("Update language code", index, languageCode);
    var doc = this.props.value;
    if(doc == null || !$.isArray(doc) || doc.length == 0) {
      //no documentation set yet - make a new array
      this.props.onChange([{'$': '', '@lang': languageCode}]);
    } else {
      var currentDoc = doc[index];
      if(currentDoc == null) {
        var newDoc = {'$': '', '@lang': languageCode};
      } else {
        var newDoc = update(currentDoc, {$merge: {'@lang': languageCode}});
      }
      this.props.onChange(update(doc, {$splice: [[index, 1, newDoc]]}));
    }
  },

  addDoc: function() {
    var doc = this.props.value;
    if(doc == null || !$.isArray(doc) || doc.length == 0) {
      if(doc != null && !$.isArray(doc)) {
        var firstValue = doc;
      } else {
        var firstValue = '';
      }
      this.props.onChange([{'$': firstValue},{'$': ''}]);
    } else {
      //add new item to array
      this.props.onChange(update(doc, {$push: [{'$': ''}]}));
    }
  },

  deleteDoc: function(index) {
    var doc = this.props.value;
    if($.isArray(doc) && doc.length > index) {
      this.props.onChange(update(doc, {$splice: [[index, 1]]}));
    }
  },

  render: function() {
    var {value, onChange, ...other} = this.props;
    var docs = ($.isArray(value) && value.length > 0) ? value : [null];

    return (
      <div>
      {
        docs.map(function(doc,index) {
          var languageCode = doc && doc['@lang'] || null;

          var modalRef = "modalTrigger" + index;
          var closeModal = this.closeDialogue.bind(this, modalRef);

          var languageInput = <ModalTrigger
            ref={modalRef}
            modalTarget="documentationLanguageModalContainer"
            label={languageCode || <Glyphicon glyph="comment"/>}
            onOpen={this.props.loadValueSchemeData}
            useLink={true}
            modal={
              <DocumentationLanguageModal
                languageCode={languageCode}
                onClose={closeModal}
                onChange={this.updateLanguageCode.bind(this, index)}
                />
            } />
          return <Input key={index} type="text" value={doc == null ? "" : doc['$']} {...other} onChange={this.updateValue.bind(this, index)}
            addonBefore={languageInput}
            addonAfter={index > 0 &&
              <a className="delete" onClick={this.deleteDoc.bind(this, index)}  title="Remove documentation item"><Glyphicon glyph="trash" /></a>
            }/>
        }.bind(this))
      }
      <div className="add-documentation-item" ><a onClick={this.addDoc} title="Add documentation item"><Glyphicon glyph="plus"/></a></div>
      </div>
    );
  },

  closeDialogue: function(modalRef, evt) {
    this.refs[modalRef].toggleModal(evt);
  },

  onChange: function(index, e) {
    var newValue;
    if(e.target.value === "") {
      newValue = null;
    } else {
      newValue = {$: e.target.value}; //TODO: documentation language
    }

    var currentDocs = this.props.value;
    if(currentDocs == null) {
      currentDocs = [];
    }

    log.trace("New value for", currentDocs, "at", index, "=", newValue);

    var newDocs;
    if(index >= currentDocs.length) {
      newDocs = update(currentDocs, {$push: [newValue]});
    } else {
      newDocs = update(currentDocs, {0: {$set: newValue}});
    }

    this.props.onChange(newDocs);
  }
});

/**
 * DocumentationLanguageModal Modal with local state initialised on passed language code value and user triggered callback to pass currently entered value
 * @type {[type]}
 */
var DocumentationLanguageModal = React.createClass({
  propTypes: {
    languageCode: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      languageCode: this.props.languageCode
    }
  },

  onChange: function() {
    var code = this.state.languageCode;
    if(code != null && code.trim() == '') {
      this.props.onChange(null);
    } else {
      this.props.onChange(code);
    }
    this.props.onClose();
  },

  onUnset: function() {
    this.props.onChange(null);
    this.props.onClose();
  },

  setLanguageCode: function(evt) {
    this.setState({languageCode: evt.target.value});
  },

  render: function() {
    return (
      <Modal.Dialog ref="modal" id="typeModal" key="typeModal" className="type-dialog" enforceFocus={true} backdrop={false}>

        <Modal.Header closeButton={true} onHide={this.props.onClose}>
          <Modal.Title>Documentation</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Input type="select" value={this.state.languageCode} onChange={this.setLanguageCode} label="Select a language:">
            <option value="">...</option>
            {
              Object.keys(languageCodes).map(function(code){
                return <option key={code} value={code}>{languageCodes[code]}</option>;
              })
            }
          </Input>
          <Input type="text" ref="languageCodeInput" value={this.state.languageCode || ""} label="or enter a language code:" labelClassName="editorFormLabel" wrapperClassName="editorFormField"
            onChange={this.setLanguageCode} buttonAfter={
              <Button disabled={this.state.languageCode == null || this.state.languageCode === ''} onClick={this.onChange}>Ok</Button>
            } />
          {this.props.languageCode &&
            <div>
              <label>or to remove the language code for this documenation element:</label>
              <div><Button bsStyle="danger" onClick={this.onUnset}><Glyphicon glyph="remove" />Unset language code</Button></div>
            </div>
          }
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.onClose}>Cancel</Button>
        </Modal.Footer>

      </Modal.Dialog>
    );
  }
});


module.exports = DocumentationInput;
