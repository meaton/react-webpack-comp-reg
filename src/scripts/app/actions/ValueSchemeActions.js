var log = require('loglevel');
var update = require('react-addons-update');
var _ = require('lodash');

var Constants = require("../constants");

var ComponentRegistryClient = require('../service/ComponentRegistryClient');

var ValueSchemeActions = {

  loadAllowedTypes: function() {
    var success = function(data) {
      this.dispatch(Constants.LOAD_ALLOWED_TYPES_SUCCESS, data.elementType);
    }.bind(this);

    var failure = function(msg) {
      this.dispatch(Constants.LOAD_ALLOWED_TYPES_FAILURE, msg);
    }.bind(this);

    ComponentRegistryClient.loadAllowedTypes(success, failure);
  },

  loadValueScheme: function(element) {
    log.trace("Loading value scheme for element", element);

    var vocabulary = null;
    var type = null;
    var pattern = null;

    if(element.ValueScheme) {
      if(element.ValueScheme.Vocabulary) {
        vocabulary = deepCopy(element.ValueScheme.Vocabulary);
      } else if(element.ValueScheme.pattern) {
        pattern = element.ValueScheme.pattern.valueOf();
      }
    } else if(element['@ValueScheme']) {
      type = element['@ValueScheme'].valueOf();
    }

    if(!(vocabulary || type || pattern)) {
      log.error("No value scheme in element", element);
    }

    this.dispatch(Constants.LOAD_VALUE_SCHEME, {
      vocabulary: vocabulary,
      type: type,
      pattern: pattern
    });

    //set initial tab after data load
    if (vocabulary != null) var tab = Constants.VALUE_SCHEME_TAB_VOCAB;
    else if (pattern != null) var tab = Constants.VALUE_SCHEME_TAB_PATTERN;
    else var tab = Constants.VALUE_SCHEME_TAB_TYPE;
    this.dispatch(Constants.SET_VALUE_SCHEME_TAB, tab);
  },

  setValueSchemeTab: function(tab) {
    this.dispatch(Constants.SET_VALUE_SCHEME_TAB, tab);
  },

  updateType: function(value) {
    this.dispatch(Constants.UPDATE_VALUE_SCHEME, {
      type: value,
    });
  },

  updatePattern: function(value) {
    this.dispatch(Constants.UPDATE_VALUE_SCHEME, {
      pattern: value,
    });
  },

  updateVocabularyItem: function(oldVocabulary, itemIndex, property, newValue) {
    log.debug("Update item",itemIndex, "of vocabulary", oldVocabulary);
    var newItem = _.cloneDeep(oldVocabulary.enumeration.item[itemIndex]);
    newItem[property] = newValue;

    var updatedVocab = update(oldVocabulary,
      {enumeration:
        {item:
          {$splice: [[itemIndex, 1, newItem]]}
        }
      });

    this.dispatch(Constants.UPDATE_VALUE_SCHEME, {
      vocabulary: updatedVocab
    });
  },

  addVocabularyItem: function(oldVocabulary) {
    log.debug("Add new item to vocabulary", oldVocabulary);

    if(oldVocabulary == null) {
      var vocab = {};
    } else {
      var vocab = oldVocabulary;
    }

    if(!vocab.enumeration || !vocab.enumeration.item) {
      vocab = update(vocab, {enumeration: {$set:
          {item: []}
      }});
    }

    var updatedVocab = update(vocab,
      {enumeration:
        {item:
          {$push:
            [
              {'$': ""}
            ]
          }
        }
      });

    this.dispatch(Constants.UPDATE_VALUE_SCHEME, {
      vocabulary: updatedVocab
    });
  },

  removeVocabularyItem: function(oldVocabulary, itemIndex) {
    var updatedVocab = update(oldVocabulary,
      {enumeration:
        {item:
          {$splice: [[itemIndex, 1]]}
        }
      });
    this.dispatch(Constants.UPDATE_VALUE_SCHEME, {
      vocabulary: updatedVocab
    });
  },

  resetValueSchemeValidationError: function() {
    this.dispatch(Constants.SET_VALUE_SCHEME_VALIDATION_ERROR, null);
  },

  validateValueScheme: function(valueScheme) {
    log.debug("Validating value scheme", valueScheme);

    if(!valueScheme) {
      this.dispatch(Constants.SET_VALUE_SCHEME_VALIDATION_ERROR, "Validation failed");
      return false;
    }

    if(valueScheme.hasOwnProperty('type')) {
      // Validate simple type
      var type = valueScheme.type;
      log.debug("Validating type", type);

      if(type == null || (typeof type !== 'string') || type.trim() === "") {
        this.dispatch(Constants.SET_VALUE_SCHEME_VALIDATION_ERROR, "Type cannot be empty");
        return false;
      }
    } else if(valueScheme.hasOwnProperty('pattern')) {
      // Validate pattern
      var pattern = valueScheme.pattern;
      log.debug("Validating pattern", pattern);

      if(pattern == null || (typeof pattern !== 'string') || pattern.trim() === "") {
        this.dispatch(Constants.SET_VALUE_SCHEME_VALIDATION_ERROR, "Pattern cannot be empty");
        return false;
      }
      //TODO: check whether valid RegEx
    } else if(valueScheme.hasOwnProperty('vocabulary')) {
      // Validate vocabulary
      var vocab = valueScheme.vocabulary;
      log.debug("Validating vocabulary", vocab);

      if(vocab == null || !vocab.enumeration || !vocab.enumeration.item || !$.isArray(vocab.enumeration.item)) {
        this.dispatch(Constants.SET_VALUE_SCHEME_VALIDATION_ERROR, "Vocabulary must have one or more items");
        return false;
      }
      var items = vocab.enumeration.item;
      //TODO: validate items in vocabulary
      //TODO: validate vocabulary URI (if set)
    } else {
      //no value at all!
      this.dispatch(Constants.SET_VALUE_SCHEME_VALIDATION_ERROR, "A value must be provided");
      return false;
    }
    return true;
  }
};

module.exports = ValueSchemeActions;

function deepCopy(obj) {
  if(obj != null) {
    return JSON.parse(JSON.stringify(obj));
  }
}
