'use strict';
var log = require('loglevel');
var Constants = require("../constants");
var sortByOrder = require('lodash').sortByOrder;

var ItemsFilter = {
  updateItems: function(items, newFilter, filteredItems, oldFilter, sortState) {
    if(newFilter === oldFilter) {
      // filter unchanged
      return this.sort(filteredItems, sortState);
    } else if(newFilter != null && filteredItems != null && oldFilter != null && newFilter.indexOf(oldFilter) == 0) {
      //narrow down on existing filtered items
      return this.filter(filteredItems, newFilter, sortState);
    } else {
      //filter on full set
      return this.filter(items, newFilter, sortState);
    }
  },

  updateFilterText: function(text) {
    return (text === "") ? null : text
  },

  filter: function(items, filter, sortState) {
    if(filter == null) {
      return this.sort(items, sortState);
    } else {
      var regex = new RegExp(escapeRegExp(filter), "i");
      return this.sort(items.filter(function(item) {
        return regex.test(item.name)
        || regex.test(item.groupName)
        || regex.test(item.description)
        || regex.test(item.creatorName)
        || regex.test(item.id);
      }), sortState);
    }
  },

  sort: function(items, sortState) {
    if(sortState == null || sortState.column == null) {
      return items;
    } else {
      log.debug("Sort by", sortState.column, sortState.order);
      var order = (sortState.order === Constants.SORT_ORDER_DESC) ? 'desc':'asc';
      return sortByOrder(items, [sortState.column], [order]);
    }
  }
}

module.exports = ItemsFilter;

function escapeRegExp(str) {
  //http://stackoverflow.com/a/6969486
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
