/** @jsx React.DOM */

var ComponentRegApp = require('./ComponentRegApp');
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;

var routes = (
    <Route handler={ComponentRegApp} path="/"></Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.getElementById('content'));
});
