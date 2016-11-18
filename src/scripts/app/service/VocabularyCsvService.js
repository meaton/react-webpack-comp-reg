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

  deserializeItems: function(csvData) {
    log.debug("Deserializing items from csv: ", csvData);
    var result = papaparse.parse(csvData, {
      skipEmptyLines: true
    });

    if(result.errors.length > 0) {
      throw result.errors;
    } else {
      var items = result.data.map(function (item) {
        return {
          '$': item[0],
          '@AppInfo': item[1],
          '@ConceptLink': item[2]
        };
      });
      log.debug("Deserialized items", items);
      return items;
    }
  }
}

module.exports = VocabularyCsvService;
