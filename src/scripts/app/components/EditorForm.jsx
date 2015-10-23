'use strict';

var log = require('loglevel');
var Constants = require("../constants");

var React = require("react"),
    Router = require('react-router'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

/**
* ComponentEditor - main editor component and route handler for editor subroutes
* @constructor
*/
var EditorForm = React.createClass({
  mixins: [FluxMixin, Router.Navigation, Router.State, StoreWatchMixin("ComponentDetailsStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      details: flux.store("ComponentDetailsStore").getState()
    };
  },

  componentDidMount: function() {
    log.debug("Path", this.getPathname());
    log.debug("Params", this.getParams());
  },

  render: function () {
    var content;

    var id = this.getId();
    var type = this.getType();

    if(this.isNew()) {
      content = this.renderContentForNew(type, id);
    } else {
      content = this.renderContentForEdit(type, id);
    }

    log.info("Editor = type:", this.getParams().type, "id:", id);

    return(<div>
      editor form
      {content}
    </div>);
  },

  renderContentForNew: function(type, id) {
    //TODO
    return (
      <div>
        <h2>New item</h2>
        <ul>
          <li>type: {type}</li>
          <li>id: {id}</li>
        </ul>
      </div>
    );
  },

  renderContentForEdit: function(type, id) {
    //TODO
    return (
      <div>
        <h2>Edit item</h2>
        <ul>
          <li>type: {type}</li>
          <li>id: {id}</li>
        </ul>
      </div>
    );
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
