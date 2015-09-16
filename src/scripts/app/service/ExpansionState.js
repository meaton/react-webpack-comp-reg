module.exports = {
  isExpanded: function(state) {
    return (state != undefined && state.expanded === true);
  },

  getChildState: function(state, id) {
    if(state != undefined && state.children != undefined) {
      return state.children[id];
    }
  },

  isChildExpanded: function(state, id) {
    return this.isExpanded(this.getChildState(state, id));
  },

  setChildState: function(state, id, value) {
    if(state.children == undefined) {
      state.children = {};
    }
    if(state.children[id] == undefined) {
      state.children[id] = {
        expanded: value,
        children: {}
      }
    } else {
      state.children[id].expanded = value;
    }
  }
}
