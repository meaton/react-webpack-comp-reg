/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Authentication = require('./Authentication.jsx').Authentication;
var Profile = require('./Profile.jsx');
var SpaceSelector = require('./SpaceSelector.jsx');
var DataTablesGrid = require('./DataTablesGrid.jsx');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var ComponentRegApp = React.createClass({
  //mixins: [ Authentication ],
  getInitialState: function() {
    return { filter: "published", type: "components" };
  },
  handleSelect: function(sel_registry) {
    this.setState(sel_registry);
  },
  render: function() {
    return (
      <div className="main">
        <SpaceSelector onSelect={this.handleSelect} />
        <Profile profileId="clarin.eu:cr1:p_1380106710826"/>
        <DataTablesGrid type={this.state.type} filter={this.state.filter} multiple={true} />
      </div>
    );
  }
});

module.exports = ComponentRegApp;
