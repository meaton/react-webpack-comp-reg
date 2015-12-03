var Constants = require("../constants");

/**
 * Browser actions
 */
module.exports = {

  selectBrowserItem: function(item) {
    this.dispatch(Constants.SELECT_BROWSER_ITEM, item);
  },

  switchMultipleSelect: function() {
    this.dispatch(Constants.SWITCH_MULTIPLE_SELECT);
  },

  /**
   * Switch to the space defined by type and registry
   * @param  {string} type     Constants.TYPE_PROFILE or Constants.TYPE_COMPONENTS
   * @param  {string} registry Constants.SPACE_PRIVATE, Constants.SPACE_PUBLISHED or Constants.SPACE_GROUP
   */
  switchSpace: function(type, space, group) {
    this.dispatch(Constants.SWITCH_SPACE, {type: type, space: space, group: group||null});
  },

  editItem: function(item) {
    this.dispatch(Constants.EDIT_ITEM);
  },

  setFilterText: function(text) {
    this.dispatch(Constants.FILTER_TEXT_CHANGE, text);
  }

};
