'use strict';

var React = require('react/addons');
var update = React.addons.update;

module.exports = {

  update: update,

  remove: function(object, key) {
    var newObj = {};
    var keys = Object.keys(object);
    // copy all keys except for key to remove
    for(i=0;i<keys.length;i++) {
      if(keys[i] !== key) {
        newObj[keys[i]] = object[keys[i]];
      }
    }
    return newObj;
  }
}
