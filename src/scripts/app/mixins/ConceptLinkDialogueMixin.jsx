'use strict';

var log = require('loglevel');

var ModalTrigger = require('../components/ModalTrigger');
var ConceptRegistryModal = require('../components/editor/ConceptRegistryModal');

/**
* Helper mixin for creating a button that triggers the CCR search dialogue. A
* callback is required for handling the selected value
* @mixin
*/
var ConceptLinkDialogueMixin = {

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

}

module.exports = ConceptLinkDialogueMixin;
