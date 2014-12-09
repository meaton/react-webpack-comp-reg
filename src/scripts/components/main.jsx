/** @jsx React.DOM */

var ComponentRegApp = require('./ComponentRegApp');
var React = require('react');
var {DefaultRoute, Route, Routes} = require('react-router');

React.renderComponent((
  <Routes location="history">
    <Route path="/" handler={ComponentRegApp}>
    </Route>
  </Routes>
), document.getElementById('content'));
