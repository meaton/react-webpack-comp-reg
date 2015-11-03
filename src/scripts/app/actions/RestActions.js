var log = require('loglevel');

var SpecAugmenter = require("../service/SpecAugmenter")

var Constants = require("../constants"),
    /* REST client */
    ComponentRegistryClient = require("../service/ComponentRegistryClient")

/**
 * Loads all linked components (with @ComponentId) that are a direct child
 * of the provided component (JSON spec). When done, the callback is called with
 * the result - this is guaranteed to happen.
 * @param  {object}   component component specification to load linked components for
 * @param  {string}   space     space to load components from
 * @param  {Function} callback  will be called with the list of loaded components
 * @param  {Object} [currentset={}]  set of already loaded linked components (these will not be loaded again)
 */
function loadLinkedComponents(component, space, callback, currentset) {
    var components = {};
    var childComponents = component.CMD_Component;
    if(currentset == undefined) {
      currentset = {};
    }

    // gather linked component IDs
    if(childComponents != undefined) {
      var linkedComponentIds = getComponentIds(childComponents, currentset);
      loadComponentsById(linkedComponentIds, space, components, callback);
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
 * @param  {[string]}   space     space to load specs from
 * @param  {[Object]}   collected collected specs thus far
 * @param  {Function} callback  gets called with result when all components have been loaded
 */
function loadComponentsById(ids, space, collected, callback) {
  var id = ids.pop();
  if(id == undefined) {
    //tail of recursion
    callback(collected);
  } else if(collected[id] != undefined) {
    // already loaded, skip this one and continue
    loadComponentsById(ids, space, collected, callback);
  } else {
    // load current id
    ComponentRegistryClient.loadSpec(Constants.TYPE_COMPONENTS, space, id, "json", function(spec){
        log.info("Loaded", id, ":", spec.Header.Name);

        if(spec == undefined) {
          log.warn("LoadSpec returned undefined. Id:", id);
        }

        SpecAugmenter.augmentWithIds(spec);

        //success
        collected[id] = spec;
        // proceed
        loadComponentsById(ids, space, collected, callback);
      },
      function(message) {
        // failure
        log.warn("Failed to load child component with id ", id, ": ", message);
        // proceed (nothing added)
        loadComponentsById(ids, space, collected, callback);
      }
    );
  }
}

function saveSpec(spec, item, update, publish, successCb) {
  this.dispatch(Constants.SAVE_COMPONENT_SPEC);
  ComponentRegistryClient.saveComponent(spec, item, item.id, update, publish, function(spec){
      // success
      this.dispatch(Constants.SAVE_COMPONENT_SPEC_SUCCESS, spec);
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
}

/**
 * Deletes a number of components (by id) by means of tail recursion
 * @param  {string} type      [description]
 * @param  {string} space     [description]
 * @param  {Array} ids       [description]
 * @param  {function} success   success callback
 * @param  {function} failure   failure callback
 * @param  {Array} [remainder] [description]
 */
function deleteComponents(type, space, ids, success, failure, remainder) {
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
      deleteComponents(type, space, ids, success, failure, remainder);
    };

    ComponentRegistryClient.deleteComponents(type, space, id, handleSuccess, failure);
  }
}

module.exports = {
  loadItems: function(type, space) {
    this.dispatch(Constants.LOAD_ITEMS);
    ComponentRegistryClient.loadComponents(type, space, function(items){
        // Success
        this.dispatch(Constants.LOAD_ITEMS_SUCCESS, items);
      }.bind(this),
      function(message) {
        // Failure
        this.dispatch(Constants.LOAD_ITEMS_FAILURE, message);
      }.bind(this)
    );
  },

  loadItem: function(type, space, itemId) {
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

  loadComponentSpec: function(type, space, itemId) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);
    // load the (JSON) spec for this item
    ComponentRegistryClient.loadSpec(type, space, itemId, "json", function(spec){
        // Success. Now also load linked child components at root level, we need
        // their names for display purposes.
        loadLinkedComponents(spec.CMD_Component, space, function(linkedComponents) {
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
   * @param  {[type]} space      space to load from
   * @param  {Object} [currentset]     set of already loaded linked components (these will not be loaded again)
   */
  loadLinkedComponentSpecs: function(parentSpec, space, currentset) {
    loadLinkedComponents(parentSpec, space, function(linkedComponents) {
      this.dispatch(Constants.LINKED_COMPONENTS_LOADED, linkedComponents);
    }.bind(this), currentset);
  },

  loadComponentSpecXml: function(type, space, item) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);
    ComponentRegistryClient.loadSpec(type, space, item.id, "text", function(specXml){
        // success
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, specXml);
      }.bind(this),
      function(message) {
        // failure
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_FAILURE, message);
      }.bind(this)
    );
  },

  saveComponentSpec: function(spec, item, space, successCb) {
    // do update, don't publish
    saveSpec.apply(this, [spec, item, true, false, successCb])
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
  },

  deleteComponents: function(type, space, ids) {
    log.info("Requesting deletion of", ids);
    this.dispatch(Constants.DELETE_COMPONENTS, ids);
    deleteComponents(type, space, ids, function(){
      this.dispatch(Constants.DELETE_COMPONENTS_SUCCESS, ids);
    }.bind(this), function(message) {
      log.error(message);
      this.dispatch(Constants.DELETE_COMPONENTS_FAILURE, {ids: ids, message: message});
    }.bind(this));
  }

};
