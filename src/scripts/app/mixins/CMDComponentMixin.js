//helpers
var ExpansionState = require('../service/ExpansionState');

/**
* CMDComponentMixin - Common functions and properties for the CMDComponent view
* and form components, mostly related to expansion state
* @mixin
*/
var CMDComponentMixin = {
  propTypes: {
    /* specification object (CMD_Component) */
    spec: React.PropTypes.object.isRequired,
    /* determines whether 'envelope' with properties should be hidden */
    hideProperties: React.PropTypes.bool,
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
    isLinked:  React.PropTypes.bool,
    expansionState: React.PropTypes.object,
    linkedComponents: React.PropTypes.object,
    onToggle: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      hideProperties: false,
      openAll: false,
      closeAll: false
    };
  },
  toggleComponent: function() {
    this.props.onToggle(this.props.spec._appId, this.props.spec);
  },

  isOpen: function() {
    return !this.props.isLinked || ExpansionState.isExpanded(this.props.expansionState, this.props.spec._appId);
  }
}

module.exports = CMDComponentMixin;
