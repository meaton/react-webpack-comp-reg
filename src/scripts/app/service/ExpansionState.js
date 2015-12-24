var React = require('react');
var update = require('react-addons-update');
var changeObj = require('../util/ImmutabilityUtil').changeObj;

module.exports = {
  /**
   * [function description]
   * @param  {object} state        state to check in
   * @param  {[type]} itemId       item to check for
   * @param  {boolean} [defaultValue=false] open if not specified?
   * @return {boolean}              whether item is expanded
   */
  isExpanded: function(state, itemId, defaultValue) {
    if(defaultValue == null) {
      defaultValue = false;
    }
    if(state != undefined && state[itemId] != undefined) {
      return (state[itemId] === true);
    } else {
      return defaultValue;
    }
  },

  setChildState: function(state, id, value) {
    // 'update' object to set value of 'id' property to 'value'
    return update(state, changeObj(id, {$set: value}));
  }
}
