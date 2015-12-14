var log = require('loglevel');

var ActionButtons = require('../components/editor/ActionButtons');

function $remove(index) {
  //update command: remove at index
  return {$splice: [[index, 1]]};
}

function $moveUp(index, items){
  //update command: replace before index with next items in reverse order
  return {$splice: [[index-1, 2, items[index], items[index-1]]]};
}

function $moveDown(index, items) {
  //update command: replace from index with next items in reverse order
  return {$splice: [[index, 2, items[index+1], items[index]]]};
}

function $move(direction, index, items) {
  //select update command for move depending on direction
  if(direction == "up") {
    return $moveUp(index, items);
  } else /*(if direction == "down")*/ {
    return $moveDown(index, items);
  }
}

/**
* ActionButtonsMixin - handlers for ActionButtons.
* @mixin
*/
var ActionButtonsMixin = {

  propTypes: {
    onMove: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    isFirst: React.PropTypes.bool,
    isLast: React.PropTypes.bool,
    onToggleExpansion: React.PropTypes.func,
    isExpanded: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      isFirst: false,
      isLast: false,
      isExpanded: true
    };
  },

  handleMoveComponent: function(changeHandler, index, direction) {
    log.debug("Move component",index,direction, "in", this.props.spec);
    changeHandler({CMD_Component: $move(direction, index, this.props.spec.CMD_Component)});
  },

  handleRemoveComponent: function(changeHandler, index) {
    log.debug("Remove component",index, "from", this.props.spec);
    changeHandler({CMD_Component: $remove(index)});
  },

  handleMoveElement: function(changeHandler, index, direction) {
    log.debug("Move element",index,direction, "in", this.props.spec);
    changeHandler({CMD_Element: $move(direction, index, this.props.spec.CMD_Element)});
  },

  handleRemoveElement: function(changeHandler, index) {
    log.debug("Remove element",index, "from", this.props.spec);
    changeHandler({CMD_Element: $remove(index)});
  },

  handleMoveAttribute: function(changeHandler, index, direction) {
    log.debug("Move attribute",index,direction, "in", this.props.spec);
    changeHandler({AttributeList: {Attribute: $move(direction, index, this.props.spec.AttributeList.Attribute)}});
  },

  handleRemoveAttribute: function(changeHandler, index) {
    log.debug("Remove attribute",index, "from", this.props.spec);
    var attrs = this.props.spec.AttributeList.Attribute;
    if(index == 0 && $.isArray(attrs) && attrs.length == 1) {
      // removal of last attribute: remove AttributeList
      changeHandler({AttributeList: {$set: null}});
    } else {
      changeHandler({AttributeList: {Attribute: $remove(index)}});
    }
  },

  createActionButtons: function(props) {
    var expansionProps = {};
    if(this.toggleExpansionState) { //from ToggleExpansionMixin
      expansionProps.onToggleExpansion = this.toggleExpansionState;
    }
    if(this.isOpen) { //from ToggleExpansionMixin
      expansionProps.isExpanded = this.isOpen();
    }
    return (
      <ActionButtons
        onMove={this.props.onMove}
        onRemove={this.props.onRemove}
        moveUpEnabled={!this.props.isFirst}
        moveDownEnabled={!this.props.isLast}
        {...expansionProps}
        {...props}
      />);
  }
};

module.exports = ActionButtonsMixin;
