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
};

module.exports = ValueSchemeActions;

function deepCopy(obj) {
  if(obj != null) {
    return JSON.parse(JSON.stringify(obj));
  }
}
