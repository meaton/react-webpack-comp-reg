var React = require('react/addons');
var update = React.addons.update;

module.exports = {
  isExpanded: function(state, itemId) {
    return (state != undefined && state[itemId] != undefined && state[itemId] === true);
  },

  setChildState: function(state, id, value) {
    var change = {};
    change[id] = {$set: value};
    return update(state, change);
  }
}
