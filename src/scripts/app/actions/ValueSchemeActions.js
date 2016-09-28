var log = require('loglevel');
var update = require('react-addons-update');
var _ = require('lodash');

var Constants = require("../constants");

var ValueSchemeActions = {
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
  }
};

module.exports = ValueSchemeActions;

function deepCopy(obj) {
  if(obj != null) {
    return JSON.parse(JSON.stringify(obj));
  }
}
