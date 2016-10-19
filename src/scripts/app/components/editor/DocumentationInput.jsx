'use strict';
var log = require('loglevel');

var React = require('react');
var update = require('react-addons-update');

//components
var ModalTrigger = require('../ModalTrigger');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

/**
* ConceptLinkInput - Text input with button to trigger CCR search
*
* @constructor
*/
var ConceptLinkInput = React.createClass({
  propTypes: {
    value: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render: function() {
    //TODO: Add language selector
    var {value, onChange, ...other} = this.props;
    var docs = ($.isArray(value) && value.length > 0) ? value : [null];

    return (
      <div>
      {
        docs.map(function(doc,index) {
          var language = doc != null && doc['@lang'];
          var languageInput = <ModalTrigger
            ref="modalTrigger"
            modalTarget="documentationLanguageModalContainer"
            label={language || <Glyphicon glyph="comment"/>}
            onOpen={this.props.loadValueSchemeData}
            useLink={true}
            modal={
              <DocumentationLanguageModal
                language={language}
                onClose={function(){log.debug("close");}}
                onChange={function(){log.debug("change");}}
                />
            } />
          return <Input key={index} type="text" value={doc == null ? "" : doc['$']} {...other} onChange={this.onChange.bind(this, index)} addonAfter={languageInput} />
        }.bind(this))
      }
      </div>
    );
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
      newDocs= update(currentDocs, {0: {$set: newValue}});
    }

    this.props.onChange(newDocs);
  }
});

var DocumentationLanguageModal = React.createClass({
  propTypes: {
    language: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  render: function() {
    return <div>bla</div>;
  }
});


module.exports = ConceptLinkInput;
