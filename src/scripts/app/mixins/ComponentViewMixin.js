'use strict';

var ExpansionState = require('../service/ExpansionState');

/**
* ComponentViewMixin - Handler for toggling components, to be used in viewer and form
* assumes Fluxxor mixin, this.state.details and this.props.space
* @mixin
*/
var ComponentViewMixin = {

  doToggleComponent: function(space, itemId, spec) {
    var wasExpanded = ExpansionState.isExpanded(this.state.details.expansionState, itemId);

    // expand view
    this.getFlux().actions.toggleItemExpansion(itemId);

    if(!wasExpanded) {
      // load child components of expanded item
      this.getFlux().actions.loadLinkedComponentSpecs(spec, space, this.state.details.linkedComponents);
    }
  }

}

module.exports = ComponentViewMixin;
