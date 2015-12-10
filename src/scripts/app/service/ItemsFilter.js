'use strict';
var log = require('loglevel');

var ItemsFilter = {
  updateItems: function(items, newFilter, filteredItems, oldFilter) {
    if(newFilter != null && filteredItems != null && oldFilter != null && newFilter.indexOf(oldFilter) == 0) {
      //narrow down on existing filtered items
      return this.filter(filteredItems, newFilter);
    } else {
      //filter on full set
      return this.filter(items, newFilter);
    }
  },

  updateFilterText: function(text) {
    return (text === "") ? null : text
  },

  filter: function(items, filter) {
    if(filter == null) {
      return items;
    } else {
      var regex = new RegExp(escapeRegExp(filter), "i");
      return items.filter(function(item) {
        return regex.test(item.name)
        || regex.test(item.groupName)
        || regex.test(item.description)
        || regex.test(item.creatorName)
        || regex.test(item.id);
      });
    }
  }
}

module.exports = ItemsFilter;

function escapeRegExp(str) {
  //http://stackoverflow.com/a/6969486
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
