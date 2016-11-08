var log = require("loglevel");
var Constants = require("../constants");
var ComponentRegistryClient = require('../service/ComponentRegistryClient');

/**
 * Browser actions
 */
module.exports = {

  selectBrowserItem: function(item, requestMulti) {
    this.dispatch(Constants.SELECT_BROWSER_ITEM, {item: item, multi: requestMulti});
  },

  selectBrowserItemId: function(type, id, space, team) {
    //get item
    ComponentRegistryClient.loadItem(id, function(item) {
      //select
      this.dispatch(Constants.SELECT_BROWSER_ITEM, {item: item});
    }.bind(this), function(err) {
      this.dispatch(Constants.SELECT_BROWSER_ITEM_FAILED, "Failed to load item with ID " + id);
    }.bind(this));
  },

  switchMultipleSelect: function() {
    this.dispatch(Constants.SWITCH_MULTIPLE_SELECT);
  },

  /**
   * Switch to the space defined by type and registry
   * @param  {string} type     Constants.TYPE_PROFILE or Constants.TYPE_COMPONENT
   * @param  {string} registry Constants.SPACE_PRIVATE, Constants.SPACE_PUBLISHED or Constants.SPACE_TEAM
   */
  switchSpace: function(type, space, team) {
    this.dispatch(Constants.SWITCH_SPACE, {type: type, space: space, team: team||null});
  },

  jumpToItem: function(itemId, type, currentSpace, currentTeam) {
    //todo: look up item. search order depends on current space/team (if provided, should be optional)
    //determine space
    //  report error if target space unreachable
    //switch space (if needed and possible)
    //select item (if possible)
  },

  editItem: function(item) {
    this.dispatch(Constants.EDIT_ITEM);
  },

  setFilterText: function(text) {
    this.dispatch(Constants.FILTER_TEXT_CHANGE, text);
  },

  toggleSortState: function(column) {
    this.dispatch(Constants.TOGGLE_SORT_STATE, column);
  },

  resetStatusFilter: function() {
    this.dispatch(Constants.RESET_STATUS_FILTER);
  },

  setStatusFilter: function(status) {
    this.dispatch(Constants.SET_STATUS_FILTER, status);
  }

};
