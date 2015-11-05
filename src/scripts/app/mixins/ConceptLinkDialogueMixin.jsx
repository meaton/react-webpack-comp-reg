'use strict';

var log = require('loglevel');

var ModalTrigger = require('../components/ModalTrigger');
var ConceptRegistryModal = require('../components/ConceptRegistryModal');

/**
* Helper mixin for creating a button that triggers the CCR search dialogue. A
* callback is required for handling the selected value
* @mixin
*/
var ConceptLinkDialogueMixin = {

  newConceptLinkDialogueButton: function(changeHandler) {
    return <ModalTrigger
      ref="modalTrigger"
      container={this}
      label="Search in concept registry..."
      modal={
        <ConceptRegistryModal
          onClose={this.closeConceptLinkDialogue}
          onSelect={changeHandler}
          container={this} />
      } />
  },

  closeConceptLinkDialogue: function(evt) {
    this.refs.modalTrigger.toggleModal(evt);
  }

}

module.exports = ConceptLinkDialogueMixin;
