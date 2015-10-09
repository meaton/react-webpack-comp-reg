var Fluxxor = require("fluxxor"),
    Constants = require("../constants");

var ItemsStore = Fluxxor.createStore({
  initialize: function(options) {
    // application mode the store will serve information for (browser or items in grid in editor)
    this.mode = Constants.MODE_BROWSER;

    this.state = {
      [Constants.MODE_BROWSER]: {
        items: [], //items to be shown in browser
        deleted: {}, //items that have been deleted or are being deleted
        loading: false, //loading state
        type: Constants.TYPE_PROFILE, //components or profiles
        space: Constants.SPACE_PUBLISHED //private, group, published
      },
      [Constants.MODE_EDITOR]: {
          items: [], //items to be shown in browser
          deleted: {}, //items that have been deleted or are being deleted
          loading: false, //loading state
          type: Constants.TYPE_COMPONENTS, //components or profiles
          space: Constants.SPACE_PUBLISHED //private, group, published
      }
    }

    this.bindActions(
      Constants.LOAD_ITEMS, this.handleLoadItems,
      Constants.LOAD_ITEMS_SUCCESS, this.handleLoadItemsSuccess,
      Constants.LOAD_ITEMS_FAILURE, this.handleLoadItemsFailure,
      Constants.SWITCH_SPACE, this.handleSwitchSpace,
      Constants.DELETE_COMPONENTS, this.handleDeleteItems,
      Constants.DELETE_COMPONENTS_SUCCESS, this.handleDeleteItemsSuccess,
      Constants.DELETE_COMPONENTS_FAILURE, this.handleDeleteItemsFailure
    );
  },

  getState: function() {
    return this.state[this.mode];
  },

  handleLoadItems: function() {
    this.getState().loading = true;
    this.emit("change");
  },

  handleLoadItemsSuccess: function(items) {
    this.getState().items = items;
    this.getState().loading = false;
    this.getState().deleted = {};
    this.emit("change");
  },

  handleLoadItemsFailure: function() {
    this.getState().loading = false;
    this.emit("change");
  },

  handleSwitchSpace: function(spaceType) {
    this.getState().type = spaceType.type;
    this.getState().space = spaceType.space;
    this.emit("change");
  },

  handleDeleteItems: function(ids) {
    this.getState().loading = true;
    for(var i=0; i<ids.length; i++) {
      var id=ids[i];
      this.getState().deleted[id] = Constants.DELETE_STATE_DELETING;
    }
    this.emit("change");
  },

  handleDeleteItemsSuccess: function(ids) {
    this.getState().loading = false;
    for(var i=0; i<ids.length; i++) {
      var id=ids[i];
      this.getState().deleted[id] = Constants.DELETE_STATE_DELETED;
    }
    this.emit("change");
  },

  handleDeleteItemsFailure: function(result) {
    this.getState().loading = false;
    for(var i=0; i<result.ids.length; i++) {
      var id=result.ids[i];
      delete this.getState().deleted[id];
    }
    this.emit("change");
  }

});

module.exports = ItemsStore;
