'use strict';

var log = require('loglevel');

var React = require('react/addons');
var update = React.addons.update;

function updateCommandInComponent(spec, appId, command) {
  // recursively build a command 'path'...
  if(spec._appId === appId) {
    // the spec we're looking for, return command here
    return command;
  } else {
    var children = spec.CMD_Component;
    if(children != undefined) {
      // search for match in children
      for(var i=0;i<children.length;i++) {
        var child = children[i];
        // try for this child...
        var childCommand = updateCommandInComponent(child, appId, command);
        if(childCommand != null) {
          // this means we have a match - wrap command to make it work on this level
          return {CMD_Component: {[i]: childCommand}};
        }
      }
    }
    return null;
  }
}

/**
 * Utilities for manipulating component specification objects
 *
 */
var ComponentSpec = {

  /**
   * Generates a new app ID for a component, element or attribute
   * @param  {[type]} parentId   [description]
   * @param  {[type]} childArray [description]
   * @return {[type]}            [description]
   */
  generateAppIdForNew: function(parentId, childArray) {
    //has to be unique, and robust against removal of other newly created children
    //combination of index and current time in ms assumed to be safe
    var index = (childArray == null ? 0 : childArray.length);
    return parentId + "/new_" + index + "_" + new Date().getTime();
  },

  /**
   * Updates a child component within a specification, identified by its appId
   * See https://facebook.github.io/react/docs/update.html
   * @param  {[type]} spec         spec to update in
   * @param  {[type]} appId        appId of component to perform command on
   * @param  {[type]} innerCommand update command to perform, e.g {foo: {$set: 'bar'}}
   * @return {[type]}              the updated spec (or original spec if the command could not be executed)
   */
  updateInComponent(spec, appId, innerCommand) {
    log.trace("Updating", appId, "in", spec, "with", innerCommand);
    var command = updateCommandInComponent(spec.CMD_Component, appId, innerCommand);
    if(command == null) {
      log.warn("Could not perform command, no component with appId", appId, "found:", innerCommand);
      return spec;
    } else {
      log.debug("Updating", spec, "with derived", command);
      return update(spec, {CMD_Component: command});
    }
  },

  isProfile(spec) {
    return spec['@isProfile']=="true";
  }

}

module.exports = ComponentSpec;
