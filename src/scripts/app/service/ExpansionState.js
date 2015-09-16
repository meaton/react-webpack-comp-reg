var React = require('react/addons');
var update = React.addons.update;

module.exports = {
  isExpanded: function(state, itemId) {
    return (state != undefined
            && state[itemId] != undefined
            && state[itemId] === true);
  },

  setChildState: function(state, id, value) {
    // 'update' object to set value of 'id' property to 'value'
    return update(state, {
      [id]: {$set: value}
    });
  }
}
