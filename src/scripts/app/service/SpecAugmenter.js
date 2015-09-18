var React = require('react/addons');
var update = React.addons.update;

var log = require('loglevel');

function needsId(element) {
  return element === "CMD_Component" || element === "CMD_Element" || element === "Attribute";
}

module.exports = {
  augmentWithIds: function(spec, baseId) {
    if(baseId == undefined) {
      baseId = "/";
    }

    log.debug("looping over " + Object.keys(spec) + " " + spec['@ComponentId']);
    var count = 0;
    for(child in spec) {
      var childSpec = spec[child];
      if(typeof childSpec == 'object') {
        // candidate for id augmentation
        var id = baseId + "/" + count++;
        log.debug("child: " + child + " {" + Object.keys(childSpec) + "}");
        if(needsId(child)) {
          // should get an id
          log.debug("child: " + child + " gets id: " + id);
          spec = update(spec, {[child]: {appId: {$set: id}}})
        }
        spec = update(spec, {[child]: {$set: this.augmentWithIds(spec[child], id)}});
      } else {
        log.debug("child of type " + (typeof childSpec));
      }
    }

    return spec;
  }
}
