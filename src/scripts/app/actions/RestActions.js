var log = require('loglevel');

var SpecAugmenter = require("../service/SpecAugmenter")

var Constants = require("../constants"),
    /* REST client */
    ComponentRegistryClient = require("../service/ComponentRegistryClient"),
    /* Component spec utils */
    ComponentSpec = require("../service/ComponentSpec");

var RestActions = {
  loadItems: function(type, space, group) {
    this.dispatch(Constants.LOAD_ITEMS);
    ComponentRegistryClient.loadComponents(type, space, group, function(items){
        // Success
        this.dispatch(Constants.LOAD_ITEMS_SUCCESS, items);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.LOAD_ITEMS_FAILURE, message);
      }.bind(this)
    );
  },

  loadEditorGridItems: function(space, group) {
    this.dispatch(Constants.LOAD_EDITOR_ITEMS);
    ComponentRegistryClient.loadComponents(Constants.TYPE_COMPONENTS, space, group, function(items){
        // Success
        this.dispatch(Constants.LOAD_EDITOR_ITEMS_SUCCESS, items);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.LOAD_EDITOR_ITEMS_FAILURE, message);
      }.bind(this)
    );
  },

  loadItem: function(type, itemId) {
    ComponentRegistryClient.loadItem(itemId, function(item){
        // Success
        this.dispatch(Constants.LOAD_ITEM_SUCCESS, item);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.LOAD_ITEM_FAILURE, message);
      }.bind(this)
    );
  },

  loadComponentSpec: function(type, itemId) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);
    // load the (JSON) spec for this item
    ComponentRegistryClient.loadSpec(type, itemId, "json", function(spec){
        // Success. Now also load linked child components at root level, we need
        // their names for display purposes.
        loadLinkedComponents(spec.CMD_Component, function(linkedComponents) {
          // Loading of linked components done...
          SpecAugmenter.augmentWithIds(spec);
          log.trace("Loaded and augmented spec: ", spec);
          this.dispatch(Constants.LOAD_COMPONENT_SPEC_SUCCES, {spec: spec, linkedComponents: linkedComponents});
        }.bind(this));
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_FAILURE, message);
      }.bind(this)
    );
  },

  /**
   * Loads all linked components in the specified spec
   * Dispatches Constants.LINKED_COMPONENTS_LOADED when done loading
   * @param  {[type]} parentSpec spec to load linked components for
   * @param  {Object} [currentset]     set of already loaded linked components (these will not be loaded again)
   */
  loadLinkedComponentSpecs: function(parentSpec, currentset) {
    loadLinkedComponents(parentSpec, function(linkedComponents) {
      this.dispatch(Constants.LINKED_COMPONENTS_LOADED, linkedComponents);
    }.bind(this), currentset);
  },

  loadComponentSpecXml: function(type, item) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);
    ComponentRegistryClient.loadSpec(type, item.id, "text", function(specXml){
        // success
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, specXml);
      }.bind(this),
      function(message) {
        // failure
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_FAILURE, message);
      }.bind(this)
    );
  },

  saveComponentSpec: function(spec, item, successCb, componentInUsageCb) {
    // do update, don't publish
    saveSpec.apply(this, [spec, item, true, false, successCb, componentInUsageCb])
  },

  saveNewComponentSpec: function(spec, item, successCb) {
    // new, don't update or publish
    saveSpec.apply(this, [spec, item, false, false, successCb])
  },

  publishComponentSpec: function(spec, item, successCb) {
    // do update and publish
    saveSpec.apply(this, [spec, item, true, true, successCb])
  },

  deleteComponents: function(type, ids, componentInUsageCb) {
    log.info("Requesting deletion of", ids);
    this.dispatch(Constants.DELETE_COMPONENTS, ids);
    deleteComponents(type, ids, function(deletedIds){
      this.dispatch(Constants.DELETE_COMPONENTS_SUCCESS, deletedIds);
    }.bind(this), function(result) {
      if(result.message != null) {
        log.error(result.message);
      }
      this.dispatch(Constants.DELETE_COMPONENTS_FAILURE, result);
    }.bind(this), componentInUsageCb);
  },

  loadTeams: function() {
    ComponentRegistryClient.loadTeams(function(groups){
        this.dispatch(Constants.LOAD_TEAMS, groups);
      }.bind(this),
      function(message){
        log.error("Failed to load user groups", message);
        this.dispatch(Constants.LOAD_TEAMS, null);
      }.bind(this)
    );
  },

  moveComponentsToGroup: function(ids, groupId) {
    log.info("Requesting moving of", ids);
    this.dispatch(Constants.MOVE_TO_TEAM, ids);
    moveComponentsToGroup(ids, groupId, function(movedIds){
      this.dispatch(Constants.MOVE_TO_TEAM_SUCCESS, movedIds);
    }.bind(this), function(result) {
      if(result.message != null) {
        log.error(result.message);
      }
      this.dispatch(Constants.MOVE_TO_TEAM_FAILURE, result);
    }.bind(this));
  },

  loadComments: function(type, componentId) {
    this.dispatch(Constants.LOAD_COMMENTS);
    ComponentRegistryClient.loadComments(componentId, type, function(comments){
        // Success
        this.dispatch(Constants.LOAD_COMMENTS_SUCCESS, comments);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.LOAD_COMMENTS_FAILURE, message);
      }.bind(this)
    );
  },

  saveComment(type, componentId, comment) {
    this.dispatch(Constants.SAVE_COMMENT, comment);
    ComponentRegistryClient.saveComment(componentId, type, comment, function(result){
        // Success
        this.dispatch(Constants.SAVE_COMMENT_SUCCESS, result);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.SAVE_COMMENT_FAILURE, message);
      }.bind(this)
    );
  },

  deleteComment(type, componentId, commentId) {
    ComponentRegistryClient.deleteComment(componentId, type, commentId, function(id, result){
        // Success
        this.dispatch(Constants.DELETE_COMMENT_SUCCESS, id);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.DELETE_COMMENT_FAILURE, message);
      }.bind(this)
    );
  },

  checkAuthState: function() {
    log.trace("Checking authentication state...");
    ComponentRegistryClient.getAuthState(function(authState){
      if(authState != null) {
        log.trace("Auth state:", authState);
        this.dispatch(Constants.CHECK_AUTH_STATE, authState);
      } else {
        this.dispatch(Constants.CHECK_AUTH_STATE, {uid: null});
      }
    }.bind(this), function(message){
      //TODO: dispatch so that store knows auth state is not up to date?
      log.error(message);
    });
  }
};

module.exports = RestActions;

// HELPER FUNCTIONS

/**
 * Loads all linked components (with @ComponentId) that are a direct child
 * of the provided component (JSON spec). When done, the callback is called with
 * the result - this is guaranteed to happen.
 * @param  {object}   component component specification to load linked components for
 * @param  {Function} callback  will be called with the list of loaded components
 * @param  {Object} [currentset={}]  set of already loaded linked components (these will not be loaded again)
 */
function loadLinkedComponents(component, callback, currentset) {
    var components = {};
    var childComponents = component.CMD_Component;
    if(currentset == undefined) {
      currentset = {};
    }

    // gather linked component IDs
    if(childComponents != undefined) {
      var linkedComponentIds = getComponentIds(childComponents, currentset);
      loadComponentsById(linkedComponentIds, components, callback);
    } else {
      // no child components, nothing to do so call callback immediately
      callback(components);
    }
}

/**
 * recursively gets the IDs of all
 * @param  {Array} childComponents child objects of type CMD_Component
 * @param  {Object} currentset     set of already loaded linked components (these will not be loaded again)
 * @return {Array}                 IDs of linked (non-inline) components
 */
function getComponentIds(childComponents, currentset) {
  var linkedComponentIds = [];

  //make sure we're dealing with an array
  if(!$.isArray(childComponents)) {
    childComponents = [childComponents];
  }

  childComponents.forEach(function(child) {
    var childId = child['@ComponentId'];
    if(childId != undefined && !currentset.hasOwnProperty(childId)) {
      linkedComponentIds.push(childId);
    } else if(child.CMD_Component != undefined) {
      //add linked component IDs in inline children (recursively)
      Array.prototype.push.apply(linkedComponentIds, getComponentIds(child.CMD_Component, currentset));
    }
  });
  return linkedComponentIds;
}

/**
 * Loads components with specified ids. When done, the callback is called with
* the result - this is guaranteed to happen.
 * @param  {[Array]}   ids       array with ids to load
 * @param  {[Object]}   collected collected specs thus far
 * @param  {Function} callback  gets called with result when all components have been loaded
 */
function loadComponentsById(ids, collected, callback) {
  var id = ids.pop();
  if(id == undefined) {
    //tail of recursion
    callback(collected);
  } else if(collected[id] != undefined) {
    // already loaded, skip this one and continue
    loadComponentsById(ids, collected, callback);
  } else {
    // load current id
    ComponentRegistryClient.loadSpec(Constants.TYPE_COMPONENTS, id, "json", function(spec){
        log.info("Loaded", id, ":", spec.Header.Name);

        if(spec == undefined) {
          log.warn("LoadSpec returned undefined. Id:", id);
        }

        SpecAugmenter.augmentWithIds(spec);

        //success
        collected[id] = spec;
        // proceed
        loadComponentsById(ids, collected, callback);
      },
      function(message) {
        // failure
        log.warn("Failed to load child component with id ", id, ": ", message);
        // proceed (nothing added)
        loadComponentsById(ids, collected, callback);
      }
    );
  }
}

/**
 * Saves a spec while checking for component usage (if callback is provided)
 * @param  {[type]} spec               [description]
 * @param  {[type]} item               [description]
 * @param  {[type]} update             [description]
 * @param  {[type]} publish            [description]
 * @param  {[type]} successCb          [description]
 * @param  {[type]} componentInUsageCb Optional callback called if component is in use
 * @return {[type]}                    [description]
 */
function saveSpec(spec, item, update, publish, successCb, componentInUsageCb) {
  log.debug("Save - update:", update, " publish:", publish);
  this.dispatch(Constants.SAVE_COMPONENT_SPEC);

  // to be called when save is eventually safe and/or confirmed
  var save = function() {
    ComponentRegistryClient.saveComponent(spec, item, item.id, update, publish, function(result){
        // success
        var type = (result["@isProfile"] === "true")?Constants.TYPE_PROFILE:Constants.TYPE_COMPONENTS;
        this.dispatch(Constants.SAVE_COMPONENT_SPEC_SUCCESS, {
          item: result.description,
          type: type,
          update: update,
          publish: publish
        });
        if(successCb) {
          successCb(spec);
        }
      }.bind(this),
      function(message, data) {
        // failure
        log.warn("Error while saving:", message, data);
        this.dispatch(Constants.SAVE_COMPONENT_SPEC_FAILURE, message);
      }.bind(this)
    );
  }.bind(this);

  // to be called when the user aborts the save action (i.e. does not confirm after usage warning)
  var abort = function() {
    log.debug("Saving of component aborted after usage check");
    this.dispatch(Constants.SAVE_COMPONENT_SPEC_SUCCESS, spec); //TODO: other event?
  }.bind(this);

  // Almost ready to try saving...
  if(componentInUsageCb == null // No callback means no usage check
    || ComponentSpec.isProfile(spec)) { // Profile, no usage check required so save
    save();
  } else {
      // Component, may be in use so check
      ComponentRegistryClient.usageCheck(item.id, function(result) {
        // result is null if not in use, otherwise has a list of profile and component descriptions
        if(result == null) {
          log.debug("Component not in use, saving without confirmation...");
          save();
        } else {
          log.debug("Component", item.id, "is in use:", result);

          var resultObj = [];
          if(result.profileDescription)
            resultObj.push({ componentId: item.id, result: result.profileDescription });
          if(result.componentDescription)
            resultObj.push({ componentId: item.id, result: result.componentDescription });
          componentInUsageCb(resultObj, save, abort);
        }
      });
  }
}

/**
 * Deletes a number of components (by id) by means of tail recursion. It
 * performs a usage check for components (not profiles) iff a componentInUsageCb
 * is provided
 * @param  {string} type      [description]
 * @param  {Array} ids       [description]
 * @param  {function} success   success callback
 * @param  {function} failure   failure callback
 * @param  {function} componentInUsageCb component in use callback
 * @param  {Array} [remainder] [description]
 */
function deleteComponents(type, ids, success, failure, componentInUsageCb, remainder) {
  if(remainder == undefined) {
    remainder = ids.slice();
  }
  if(remainder.length == 0) {
    // done
    log.trace("Nothing left to delete");
    success(ids);
  } else {
    // some items left to delete... take first
    var id = remainder.shift();
    log.trace("Requesting deletion of", id);

    // callback that wraps success callback, passing it with remainder to
    // this function
    var handleSuccess = function() {
      //deleted
      log.trace("Successfully deleted", id);
      //process remainder
      deleteComponents(type, ids, success, failure, componentInUsageCb, remainder);
    };

    var handleFailure = function(msg) {
      remainder.push(id);
      var removed = $(ids).not(remainder).get();
      log.debug("Abort deletion",ids, remainder, "- Removed:", removed);
      if(removed.length != 0) {
        success(removed);
      }
      failure({
        message: msg,
        ids: remainder
      });
    };

    tryDeleteComponent(type, id, componentInUsageCb,
      ComponentRegistryClient.deleteComponent.bind(null, type, id, handleSuccess, handleFailure),
      handleFailure.bind(null, null));
  }
}

/**
 * Tries to delete a component, aborts if component is in use
 * @param  {[type]} type               [description]
 * @param  {[type]} id                 [description]
 * @param  {[type]} componentInUsageCb [description]
 * @param  {[type]} doDelete           [description]
 * @param  {[type]} doAbort            [description]
 * @return {[type]}                    [description]
 */
function tryDeleteComponent(type, id, componentInUsageCb, doDelete, doAbort) {
  // Almost ready to try saving...
  if(componentInUsageCb == null // No callback means no usage check
    || type == Constants.TYPE_PROFILE) { // Profile, no usage check required so save
    doDelete();
  } else {
      // Component, may be in use so check
      ComponentRegistryClient.usageCheck(id, function(result) {
        // result is null if not in use, otherwise has a list of profile and component descriptions
        if(result == null) {
          log.debug("Component not in use, can be deleted...");
          doDelete();
        } else {
          log.debug("Component requested for deletion", id, "is in use:", result);

          var resultObj = [];
          if(result.profileDescription)
            resultObj.push({ componentId: id, result: result.profileDescription });
          if(result.componentDescription)
            resultObj.push({ componentId: id, result: result.componentDescription });
          componentInUsageCb(resultObj, doDelete, doAbort);
        }
      });
  }
}

/**
 * Moves a number of components (by id) by means of tail recursion.
 * @param  {Array} ids       [description]
 * @param  {number} groupId       [description]
 * @param  {function} success   success callback
 * @param  {function} failure   failure callback
 * @param  {Array} [remainder] [description]
 */
function moveComponentsToGroup(ids, groupId, success, failure, remainder) {
  if(remainder == undefined) {
    remainder = ids.slice();
  }
  if(remainder.length == 0) {
    // done
    log.trace("Nothing left to move");
    success(ids);
  } else {
    // some items left to move... take first
    var id = remainder.shift();
    log.trace("Requesting moving of", id);

    // callback that wraps success callback, passing it with remainder to
    // this function
    var handleSuccess = function() {
      //moved
      log.trace("Successfully moved", id);
      //process remainder
      moveComponentsToGroup(ids, groupId, success, failure, remainder);
    };

    ComponentRegistryClient.transferComponent(id, groupId,
      handleSuccess, //success
      function(msg) { //failure
        remainder.push(id);
        failure({
          message: msg,
          ids: remainder
        });
      });
  }
}
