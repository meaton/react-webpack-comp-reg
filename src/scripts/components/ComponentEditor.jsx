'use strict';

var React = require('react');

//components
var Authentication = require('./Authentication').Authentication;

require('../../styles/ComponentEditor.sass');

/**
* ComponentEditor - main editor component and route handler for editor subroutes
* @constructor
*/
var ComponentEditor = React.createClass({
  mixins: [Authentication],
  render: function () {
    return (
          {this.props.children}
      );
  }
});

module.exports = ComponentEditor;
