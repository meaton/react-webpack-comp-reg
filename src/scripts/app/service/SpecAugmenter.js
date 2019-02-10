/**
 * This utility takes (part of) a component spec and recursively adds a unique
 * '_appId' property to all CMD Component, Element and Attribute objects.
 */

var React = require('react');
var update = require('react-addons-update');

var log = require('loglevel');

function needsId(element) {
  // these XML elements should be augmented with an ID
  return element === "Component" || element === "Element" || element === "Attribute";
}

function updateChild(childName, childSpec, id) {
  if(needsId(childName)) {
    // should get an id

    log.trace("Augmenting " + childName + " with id " + id);
    childSpec['_appId'] = id;
  }
  augmentWithIds(childSpec, id);
}

function augmentWithIds(spec, baseId) {
  if(baseId == undefined) {
    baseId = "0";
  }

  //loop over the spec's chilren
  var count = 0;
  for(var child in spec) {
    var name = child;
    // candidate for id augmentation
    var childSpec = spec[child];
    if(Array.isArray(childSpec)) {
      // multiple children of a type show up as an array, loop over these
      for(var i=0; i<childSpec.length; i++) {
        var c = childSpec[i];
        // build on the current id with increment to ensure uniqueness within document
        updateChild(name, c, (baseId + "/" + count++));
      }
    } else if(typeof childSpec == 'object') {
      // only a single child...
      // build on the current id with increment to ensure uniqueness within document
      updateChild(child, childSpec, (baseId + "/" + count++));
    }
  }
}

module.exports = {
  /**
   * Augments all Component, Element and Attribute elements in the spec
   * with a unique '_appId' property
   */
  augmentWithIds: function(spec) {
    var baseId;

    // Random numbers are appended to prevent expansion of multiple display
    // instances of the same (linked) component. Uniqueness is the only purpose
    // of these IDs, but including the component ID makes for nicer debugging.
    baseId = Math.floor(Math.random()*99999);
    if(spec.Header != undefined && spec.Header.ID != undefined) {
      // include ID from header
      baseId = spec.Header.ID + "#" + baseId;
    } else if(spec.hasOwnProperty('@ComponentRef')) {
      // include ID from attribute
      baseId = spec['@ComponentRef'] + "#" + baseId;
    } else {
      baseId = "new_" + baseId;
    }

    augmentWithIds(spec, baseId);
  }
}
