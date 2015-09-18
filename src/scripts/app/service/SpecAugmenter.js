var React = require('react/addons');
var update = React.addons.update;

var log = require('loglevel');

function needsId(element) {
  return element === "CMD_Component" || element === "CMD_Element" || element === "Attribute";
}

function updateChild(theChildName, theChildSpec, theId) {
  if(needsId(theChildName)) {
    // should get an id
    log.debug("child gets id: " + theId);
    theChildSpec.appId = theId;
  }
  augmentWithIds(theChildSpec, theId);
}

function augmentWithIds(spec, baseId) {
  if(baseId == undefined) {
    baseId = "/";
  }

  //log.debug("looping over " + Object.keys(spec) + " " + spec['@ComponentId']);
  log.debug("looping over " + JSON.stringify(spec) + " " + spec['@ComponentId']);
  var count = 0;
  for(var child in spec) {
    var name = child;
    // candidate for id augmentation
    var childSpec = spec[child];
    if(Array.isArray(childSpec)) {
      log.debug("child: " + child + " = array " + childSpec + " length " + childSpec.length);
      for(var i=0; i<childSpec.length; i++) {
        var c = childSpec[i];
        log.debug("child spec '" + name + "' " + i + ": " + JSON.stringify(c));
        updateChild(name, c, (baseId + "/" + count++));
      }
    } else if(typeof childSpec == 'object') {
      log.debug("NOT an array: " + childSpec + " " + typeof childSpec);
      log.debug("child: " + child + " {" + Object.keys(childSpec) + "}");
      updateChild(child, childSpec, (baseId + "/" + count++));
    } else {
      log.debug("child of type " + (typeof childSpec));
    }
  }
}

module.exports = {
  augmentWithIds: function(spec, baseId) {
    augmentWithIds(spec, baseId);
  }
}
