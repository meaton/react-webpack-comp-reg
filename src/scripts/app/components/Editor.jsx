'use strict';

var React = require('react');
var {RouteHandler, Navigation} = require('react-router');

require('../../../styles/ComponentEditor.sass');

/**
* ComponentEditor - main editor component and route handler for editor subroutes
* @constructor
*/
var Editor = React.createClass({
  render: function () {
    return (
      <section id="editor">
        <h2>Component Editor</h2>
        <RouteHandler/>
        //grid
      </section>
      );
  }
});

module.exports = Editor;
