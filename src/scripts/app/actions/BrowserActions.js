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

  jumpToItem: function(type, itemId) {
    this.dispatch(Constants.JUMP_TO_ITEM);

    //deferred: item lookup -> (team lookup) -> space lookup

    //final goal is to look up the space
    var spaceLookup = $.Deferred();
    spaceLookup.done(function(item, space, team){
      this.dispatch(Constants.SWITCH_SPACE, {type: type, space: space, team: team});
      this.dispatch(Constants.SELECT_BROWSER_ITEM, {item: item});
      this.dispatch(Constants.JUMP_TO_ITEM_SUCCESS);
    }.bind(this));

    spaceLookup.fail(this.dispatch.bind(this, Constants.JUMP_TO_ITEM_FAILURE));

    //look up item details, space lookup may not require further requests
    var itemLookup = $.Deferred();
    itemLookup.done(function(item) {
      log.debug("Target item data:", item);
      if(item.isPublic === 'true') {
        //implies null team, space lookup also done
        spaceLookup.resolve(item, Constants.SPACE_PUBLISHED, null);
      } else {
        //space lookup requires a lookup of teams
        var teamLookup = $.Deferred();
        ComponentRegistryClient.loadItemGroups(itemId, teamLookup.resolve, teamLookup.reject);
        teamLookup.done(function(teamData) {
          log.debug("Target item team data:", teamData);
          //we have the team information...
          if(teamData == null || $.isArray(teamData) && teamData.length == 0) {
            //no data? item not in team,  so
            spaceLookup.resolve(item, Constants.SPACE_PRIVATE, null);
          } else {
            if($.isArray(teamData)) {
              var team = teamData[0];
            } else {
              var team = teamData;
            }
            if(team != null && team.id != null) {
              spaceLookup.resolve(item, Constants.SPACE_TEAM, team.id);
            } else {
              spaceLookup.reject("Invalid team information, could not jump to item");
            }
          }
        }.bind(this));
        teamLookup.fail(spaceLookup.reject);
        var space = Constants.SPACE_PRIVATE;
      }
    }.bind(this));
    itemLookup.fail(spaceLookup.reject);

    ComponentRegistryClient.loadItem(itemId, itemLookup.resolve, itemLookup.reject);
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
