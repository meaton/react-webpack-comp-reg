'use strict';

var React = require('react');
var Router = require('react-router');

var { Route, RouteHandler, DefaultRoute, Link, NotFoundRoute } = Router;

var Authentication = require('./Authentication');
var { auth, Login, Logout } = Authentication;

var ComponentRegApp = require('./ComponentRegApp.jsx');
var ComponentViewer = require('./ComponentViewer.jsx');
var ComponentEditor = require('./ComponentEditor.jsx');

var PageHeader = require('react-bootstrap/lib/PageHeader');

var UserSetting = React.createFactory(React.createElement('h1', {}, "Settings"));
/*React.createClass({
    render: function() {
      return (
        <h1>Settings</h1>
      );
    }
});
*/

var NotFound = React.createFactory(React.createElement('h1', {}, "Not Found"));
/*React.createClass({
  render: function() {
    return (
      <h1>Not Found</h1>
    );
  }
});
*/

require('../../styles/main.css');
require('../../styles/normalize.css');

var Main = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: auth.loggedIn(),
      displayName: ''
    };
  },
  setStateOnAuth: function(loggedIn, displayName) {
    this.setState({
      loggedIn: loggedIn,
      displayName: displayName
    });
  },
  componentWillMount: function() {
    auth.onChange = this.setStateOnAuth;
    auth.login();
  },
  render: function() {
     var loginOrOut = this.state.loggedIn ?
       <div className="auth-logged-in">{this.state.displayName} <Link to="settings">settings</Link> <Link to="logout">logout</Link></div> :
       <Link to="login">login</Link>;
    return (
      <div>
        <PageHeader>CMDI Component Registry <small>ReactJS/REST Test</small></PageHeader>
        <div className="auth-login">{loginOrOut}</div>
        <RouteHandler/>
      </div>
    );
  }
});

var routes = (
    <Route handler={Main} path="/" >
      <NotFoundRoute handler={NotFound}/>
      <Route name="login" handler={Login} />
      <Route name="logout" handler={Logout} />
      <Route name="settings" handler={UserSetting} />
      <Route path="editor" handler={ComponentEditor}>
        <Route name="component" path="component/:component" handler={ComponentViewer} />
        <Route name="profile" path="profile/:profile" handler={ComponentViewer} />
      </Route>
      <DefaultRoute handler={ComponentRegApp} />
    </Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.getElementById('content'));
});
