/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Profile = require('./Profile.jsx');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var ComponentRegApp = React.createClass({
  render: function() {
    return (
      <div className="main">
        <Profile profileId="clarin.eu:cr1:p_1380106710826"/>
      </div>
    );
  }
});

module.exports = ComponentRegApp;
