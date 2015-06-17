/*
* LinkedStateMixin - Alternate to React.addons.LinkedStateMixin, with support for deep path-based state access.
* @mixin
* @author Tung Dao me@tungdao.com
* @see gist.github.com/tungd/8367229
* @description Modified to use clone module when setting new state on target component.
*/
var clone = require('clone');

function getIn(object, path) {
  var stack = path.split('.');
  while (stack.length > 1) {
    object = object[stack.shift()];
  }
  return object[stack.shift()];
}

function updateIn(object, path, value) {
  var current = object, stack = path.split('.');
  while (stack.length > 1) {
    current = current[stack.shift()];
  }
  current[stack.shift()] = value;
  return object;
}

function setPartialState(component, path, value) {
  component.setState(
    updateIn(clone(component.state), path, value));
}

exports.linkState = function(path) {
  return {
    value: getIn(this.state, path),
    requestChange: setPartialState.bind(null, this, path)
  };
};
