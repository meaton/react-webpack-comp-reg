'use strict';

var React = require('react');
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

  renderMoreLessToggler: function(opts) {
    if(!this.isMoreShown()) {
      //toggle will expand
      var glyph = opts && opts.expandGlyph || "chevron-right";
      var title = opts && opts.expandTitle || "Show more";
      var text = opts && opts.expandText; // optional
    } else {
      //toggle will collapse
      var glyph = opts && opts.collapseGlyph || "chevron-up";
      var title = opts && opts.collapseTitle || "Show less";
      var text = opts && opts.collapseText; // optional
    }

    return (<a onClick={this.toggleMoreLess} title={title}><Glyphicon glyph={glyph} />{text && " " + text}</a>);
  }

}

module.exports = MoreLessComponentMixin;
