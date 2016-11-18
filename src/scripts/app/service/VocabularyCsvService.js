'use strict';
var log = require('loglevel');
var papaparse = require('papaparse');

var VocabularyCsvService = {

  serializeItems: function(items) {
    log.debug("Serializing items to csv", items);

    var data = papaparse.unparse(
      {
        fields: ['$', '@AppInfo', '@ConceptLink'],
        data: items
      }, {
        newline: "\r\n"
      }
    );

    //remove first line (header)
    data = _(data)
        .split("\r\n")
        .rest()
        .join("\r\n");

    log.debug("Serialized items:", data);
    return data;
  },

  deserializeItems: function(data) {
    log.debug("Deserializing items from csv: ", data);
    var items = papaparse.parse(data);
    log.debug("Deserialized items", items);
    return items;
  }
}

module.exports = VocabularyCsvService;
