'use strict';

var ExpansionState = require('../service/ExpansionState');

/**
* ComponentViewMixin - Handler for toggling components, to be used in viewer and form
* assumes Fluxxor mixin, this.state.details and this.props.space
* @mixin
*/
var ComponentViewMixin = {

  /**
   * [function description]
   * @param  {string} space        [description]
   * @param  {string} itemId       [description]
   * @param  {object} spec         [description]
   * @param  {boolean} defaultState state to assume if state is not stored explicitly
   */
  doToggle: function(itemId, spec, defaultState) {
    var wasExpanded = ExpansionState.isExpanded(this.state.details.expansionState, itemId, defaultState);

    // expand view
    this.getFlux().actions.toggleItemExpansion(itemId, defaultState);

    if(!wasExpanded) {
      // load child components of expanded item
      this.getFlux().actions.loadLinkedComponentSpecs(spec, this.state.details.linkedComponents);
    }
  }

}

module.exports = ComponentViewMixin;
