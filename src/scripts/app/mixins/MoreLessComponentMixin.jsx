'use strict';

var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

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
  },

  renderMoreLessToggler: function() {
    if(this.isMoreShown()) {
      var glyph =  "chevron-up";
      var title = "Show less";
    } else {
      var glyph =  "chevron-down";
      var title = "Show more";
    }

    return (<Button onClick={this.toggleMoreLess} title={title}><Glyphicon glyph={glyph} /></Button>);
  }

}

module.exports = MoreLessComponentMixin;
