'use strict';

var log = require('loglevel');
var Constants = require("../constants");

var React = require("react"),
    Router = require('react-router'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var ComponentSpecForm = require("./ComponentSpecForm");
var ComponentViewMixin = require('../mixins/ComponentViewMixin');

/**
* EditorForm - Form routing endpoint for spec editor, either new/existing component/profile
* Params assumed: 'type' and 'componentId' OR 'profileId'
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
    var params = this.getParams();
    log.debug("Editor - path:", this.getPathname(), "params:", params);

    // set application state through actions, after this avoid using params directly

    // determine id - take either from componentId or profileId
    // may be null in case of a new item
    var id = params.componentId;
    if(id == undefined) {
      id = params.profileId;
    }

    // determine type
    var type;
    if(params.type != undefined) {
      type = params.type;
    } else if (params.componentId != undefined) {
      type = Constants.TYPE_COMPONENTS;
    } else if (params.profileId != undefined) {
      type = Constants.TYPE_PROFILE;
    } else {
      log.error("Unknown type for editor", params);
    }

    var space = params.space;

    this.getFlux().actions.openEditor(type, space, id);
    // load the spec for editing
    this.getFlux().actions.loadComponentSpec(type, space, id);
  },

  render: function () {
    if(this.state.details.loading) {
      <div>Loading component...</div>
    } else {
      var newItem = this.isNew();
      return (
        <div>
          <h3>
            {this.state.editor.type === Constants.TYPE_PROFILE
              ? (newItem?"New profile":"Edit profile")
              :(newItem?"New component":"Edit component")}

              &nbsp;in &quot;{this.state.editor.space}&quot;</h3>
          <ComponentSpecForm
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
    this.doToggleComponent(this.state.editor.space, itemId, spec);
  },

  isNew: function() {
    var routes = this.getRoutes();
    var lastRoute = routes[routes.length - 1];
    return lastRoute.name === "newEditor"
            || lastRoute.name === "newComponent"
            || lastRoute.name === "newProfile";
  }
});

module.exports = EditorForm;
