var log = require('loglevel');

function remove(index) {
  //update command: remove at index
  return {$splice: [[index, 1]]};
}

function moveUp(index, items){
  //update command: replace before index with next items in reverse order
  return {$splice: [[index-1, 2, items[index], items[index-1]]]};
}

function moveDown(index, items) {
  //update command: replace from index with next items in reverse order
  return {$splice: [[index, 2, items[index+1], items[index]]]};
}

function move(direction, index, items) {
  //select update command for move depending on direction
  if(direction == "up") {
    return moveUp(index, items);
  } else /*(if direction == "down")*/ {
    return moveDown(index, items);
  }
}

/**
* ActionButtonsMixin - handlers for ActionButtons.
* @mixin
*/
var ActionButtonsMixin = {

  handleMoveComponent: function(changeHandler, index, direction) {
    log.debug("Move component",index,direction, "in", this.props.spec);
    changeHandler({CMD_Component: move(direction, index, this.props.spec.CMD_Component)});
  },

  handleRemoveComponent: function(changeHandler, index) {
    log.debug("Remove component",index, "from", this.props.spec);
    changeHandler({CMD_Component: remove(index)});
  }
};

module.exports = ActionButtonsMixin;
