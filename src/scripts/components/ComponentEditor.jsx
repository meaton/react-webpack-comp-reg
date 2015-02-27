'use strict';

var React = require('react');
var {RouteHandler} = require('react-router');

//require('../../styles/ComponentEditor.sass');

var ComponentEditor = React.createClass({
  render: function () {
    return (
        <div className="editor">
          <RouteHandler/>
        </div>
      );
  }
});

module.exports = ComponentEditor;
