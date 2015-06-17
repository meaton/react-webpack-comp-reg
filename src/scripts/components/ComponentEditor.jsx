'use strict';

var React = require('react');
var {RouteHandler, Navigation} = require('react-router');

//components
var Authentication = require('./Authentication').Authentication;

require('../../styles/ComponentEditor.sass');

/*
* ComponentEditor - main editor component and route handler for editor subroutes
* @constructor
*/
var ComponentEditor = React.createClass({
  mixins: [Authentication],
  render: function () {
    return (
          <RouteHandler/>
      );
  }
});

module.exports = ComponentEditor;
