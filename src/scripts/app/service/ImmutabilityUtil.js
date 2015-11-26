'use strict';

var React = require('react/addons');
var update = React.addons.update;

module.exports = {

  update: update,

  /**
   * Immutable helper function that clones an associative object except for one or more keys
   * @param  {[type]} object       object to remove from
   * @param  {[type]} keysToRemove key or array of keys
   * @return {[type]}              a copy of the original object with the items at the key(s) removed
   */
  remove: function(object, keysToRemove) {
    var newObj = {};
    var keys = Object.keys(object);

    if($.isArray(keysToRemove)) {
      // Case of array:
      // copy all keys except for keys (from array) to remove
      for(i=0;i<keys.length;i++) {
        if(!keysToRemove.includes(keys[i])) {
          newObj[keys[i]] = object[keys[i]];
        }
      }
    } else {
      // Case of single key:
      // copy all keys except for single key to remove
      for(i=0;i<keys.length;i++) {
        if(keys[i] !== keysToRemove) {
          newObj[keys[i]] = object[keys[i]];
        }
      }
    }
    return newObj;
  }
}
