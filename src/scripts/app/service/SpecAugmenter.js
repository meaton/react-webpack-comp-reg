var React = require('react/addons');
var update = React.addons.update;

var log = require('loglevel');

function needsId(element) {
  // these XML elements should be augmented with an ID
  return element === "CMD_Component" || element === "CMD_Element" || element === "Attribute";
}

function updateChild(childName, childSpec, id) {
  if(needsId(childName)) {
    // should get an id
    log.trace("Augmenting " + childName + " with id " + id);
    childSpec.appId = id;
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
        updateChild(name, c, (baseId + "/" + count++));
      }
    } else if(typeof childSpec == 'object') {
      // only a single child...
      updateChild(child, childSpec, (baseId + "/" + count++));
    }
  }
}

module.exports = {
  /**
   * Augments all CMD_Component, CMD_Element and Attribute elements in a spec
   * with a unique 'appId' property
   */
  augmentWithIds: function(spec, baseId) {
    augmentWithIds(spec, baseId);
  }
}
