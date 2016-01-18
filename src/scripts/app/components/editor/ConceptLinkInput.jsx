'use strict';
var log = require('loglevel');

var React = require('react');

var ModalTrigger = require('../ModalTrigger');
var ConceptRegistryModal = require('./ConceptRegistryModal');

//bootstrap
var ValidatingTextInput = require('./ValidatingTextInput');

/**
* ConceptLinkInput - Text input with button to trigger CCR search
*
* @constructor
*/
var ConceptLinkInput = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    updateConceptLink: React.PropTypes.func.isRequired
  },

  render: function() {
    var {
      onChange, updateConceptLink, //wrap
      buttonAfter, type, //swallow
      ...otherProps //rest for passing on
      } = this.props;
    return (
      <ValidatingTextInput
        type="text"
        onChange={onChange /*todo: warn if isocat*/}
        buttonAfter={this.newConceptLinkDialogueButton(updateConceptLink)}
        {...otherProps}
        />
    );
  },

  newConceptLinkDialogueButton: function(changeHandler, closeHandler, label, ref) {
    if(ref == null) {
     ref = "modalTrigger";
   }
   if(closeHandler == null) {
     closeHandler = this.closeConceptLinkDialogue.bind(this,ref);
   }

    return <ModalTrigger
      ref={ref}
      modalTarget="ccrModalContainer"
      label={label != null ? label : "Search in concept registry..."}
      modal={
        <ConceptRegistryModal
          onClose={closeHandler}
          onSelect={changeHandler}
          container={this} />
      } />
  },

  closeConceptLinkDialogue: function(ref, evt) {
    this.refs[ref].toggleModal(evt);
  }
});

module.exports = ConceptLinkInput;
