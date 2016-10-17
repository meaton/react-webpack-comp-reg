'use strict';

/**
* MoreLessComponentMixin - Mixin for components with a 'more/less' behaviour
* @mixin
*/
var MoreLessComponentMixin = {

  getInitialState: function() {
    return {
      _moreLessExpanded: false
    };
  },

  toggleMoreLess: function() {
    this.setState({
      _moreLessExpanded:  !this.state['_moreLessExpanded']
    });
  },

  isMoreShown: function() {
    return this.state['_moreLessExpanded'];
  }

}

module.exports = MoreLessComponentMixin;
