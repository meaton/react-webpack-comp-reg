'use strict';

var log = require('loglevel');
var Constants = require("../constants");

var React = require("react"),
    Router = require('react-router'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var ComponentSpecView = require("./ComponentSpecView");
var ComponentViewMixin = require('../mixins/ComponentViewMixin');

/**
* ComponentEditor - main editor component and route handler for editor subroutes
* @constructor
*/
var EditorForm = React.createClass({
  mixins: [FluxMixin, Router.Navigation, Router.State, ComponentViewMixin,
    StoreWatchMixin("ComponentDetailsStore", "EditorStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      details: flux.store("ComponentDetailsStore").getState(),
      editor: flux.store("EditorStore").getState()
    };
  },

  componentDidMount: function() {
    log.debug("Path", this.getPathname());
    log.debug("Params", this.getParams());

    var id = this.getId();
    var type = this.getType();
    var space = this.getParams().space;
    //todo: trigger load spec
    this.getFlux().actions.openEditor(type, space, id);
    this.getFlux().actions.loadComponentSpec(type, space, id);
  },

  render: function () {
    var content;

    var id = this.getId();
    var type = this.getType();
    var newItem = this.isNew();

    log.debug("Editor = type:", this.getParams().type, "id:", id, "spec:", this.state.details.spec);

    if(this.state.details.loading) {
      <div>Loading component...</div>
    } else {
      return (
        <div>
          <h3>{type === Constants.TYPE_PROFILE ? (newItem?"New profile":"Edit profile"):(newItem?"New component":"Edit component")}</h3>
          {/*TODO: replace with component spec form*/}
          <ComponentSpecView
            spec={this.state.details.spec}
            expansionState={this.state.details.expansionState}
            linkedComponents={this.state.details.linkedComponents}
            onComponentToggle={this.toggleComponent}
            />
        </div>
      );
    }
  },

  toggleComponent: function(itemId, spec) {
    // from ComponentViewMixin
    this.doToggleComponent(this.getParams().space, itemId, spec);
  },

  isNew: function() {
    var routes = this.getRoutes();
    var lastRoute = routes[routes.length - 1];
    return lastRoute.name === "newEditor"
            || lastRoute.name === "newComponent"
            || lastRoute.name === "newProfile";
  },

  getId: function() {
    var compId = this.getParams().componentId;
    if(compId != undefined) {
      return compId;
    } else {
      return this.getParams().profileId;
    }
  },

  getType: function() {
    if(this.getParams().type != undefined) {
      return this.getParams().type;
    } else if (this.getParams().componentId != undefined) {
      return Constants.TYPE_COMPONENTS;
    } else if (this.getParams().profileId != undefined) {
      return Constants.TYPE_PROFILE;
    }
  }
});

module.exports = EditorForm;
