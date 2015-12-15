var log = require('loglevel');

var ReactDOM = require('react-dom');

var ActionButtons = require('../components/ActionButtons');
var ReactAlert = require('../util/ReactAlert');

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

  getInitialState: function() {
    return {wasMoved: false}
  },

  beforeMove: function(handler, direction) {
    // start animation on move
    $(ReactDOM.findDOMNode(this)).fadeTo(200, .1, function() {
      this.setState({wasMoved: true});
      handler(direction);
    }.bind(this));
  },

  componentDidUpdate: function(prevProps) {
    // finish animation on move
    if(this.state.wasMoved) {
      var node = $(ReactDOM.findDOMNode(this));
      node.fadeTo(500, 1);
      this.setState({wasMoved: false});
    }

    //TODO: scroll to new pos?
    // parent.animate({
    //   scrollTop: parent.scrollTop() + node.offset().top - node.height()/2,
    // }, function() {
    //   node.fadeTo(500, 1);
    // });
  },

  handleMoveComponent: function(changeHandler, index, direction) {
    log.debug("Move component",index,direction, "in", this.props.spec);
    changeHandler({CMD_Component: $move(direction, index, this.props.spec.CMD_Component)});
  },

  handleRemoveComponent: function(changeHandler, index) {
    log.debug("Remove component",index, "from", this.props.spec);
    ReactAlert.showConfirmationDialogue("Remove component?", "Are you sure that you want to remove this component?", function() {
        changeHandler({CMD_Component: $remove(index)});
    });
  },

  handleMoveElement: function(changeHandler, index, direction) {
    log.debug("Move element",index,direction, "in", this.props.spec);
    changeHandler({CMD_Element: $move(direction, index, this.props.spec.CMD_Element)});
  },

  handleRemoveElement: function(changeHandler, index) {
    log.debug("Remove element",index, "from", this.props.spec);
    ReactAlert.showConfirmationDialogue("Remove element?", "Are you sure that you want to remove this element?", function() {
      changeHandler({CMD_Element: $remove(index)});
    });
  },

  handleMoveAttribute: function(changeHandler, index, direction) {
    log.debug("Move attribute",index,direction, "in", this.props.spec);
    changeHandler({AttributeList: {Attribute: $move(direction, index, this.props.spec.AttributeList.Attribute)}});
  },

  handleRemoveAttribute: function(changeHandler, index) {
    log.debug("Remove attribute",index, "from", this.props.spec);
    ReactAlert.showConfirmationDialogue("Remove attribute?", "Are you sure that you want to remove this attribute?", function() {
      var attrs = this.props.spec.AttributeList.Attribute;
      if(index == 0 && $.isArray(attrs) && attrs.length == 1) {
        // removal of last attribute: remove AttributeList
        changeHandler({AttributeList: {$set: null}});
      } else {
        changeHandler({AttributeList: {Attribute: $remove(index)}});
      }
    }.bind(this));
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
        container={this}
        onMove={this.beforeMove.bind(null, this.props.onMove)}
        onRemove={this.props.onRemove}
        moveUpEnabled={!this.props.isFirst}
        moveDownEnabled={!this.props.isLast}
        {...expansionProps}
        {...props}
      />);
  }
};

module.exports = ActionButtonsMixin;
