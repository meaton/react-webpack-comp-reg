'use strict';

var React = require('react');
var {RouteHandler, Navigation} = require('react-router');

//components
var Authentication = require('./Authentication').Authentication;

require('../../styles/ComponentEditor.sass');

var ComponentEditor = React.createClass({
  mixins: [Authentication],
  render: function () {
    return (
          <RouteHandler/>
      );
  }
});

module.exports = ComponentEditor;
