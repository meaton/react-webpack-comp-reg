'use strict';
var log = require('loglevel');

var VocabularyCsvService = {

  serializeItems: function(items) {
    log.debug("Serializing items to csv", items);
    //TODO
    return "items";
  },

  deserializeItems: function(data) {
    log.debug("Deserializing items from csv: ", data);
    //TODO
    return [{'$': 'test'}];
  }
}

module.exports = VocabularyCsvService;
