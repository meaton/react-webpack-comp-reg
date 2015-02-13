/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Authentication = require('./Authentication.jsx').Authentication;
var Profile = require('./ProfileOverview.jsx');
var Component = require('./ComponentOverview.jsx');
var SpaceSelector = require('./SpaceSelector.jsx');
var DataTablesGrid = require('./DataTablesGrid.jsx');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var ComponentRegApp = React.createClass({
  //mixins: [ Authentication, React.addons.LinkedStateMixin ], //TODO: enable linked state mixins to tie state variable (currentSelectedItem) to children component properties
  getInitialState: function() {
    return { filter: "published", type: "profiles", profileId: null, componentId: null };
  },
  handleSelect: function(sel_registry) {
    this.setState($.extend(sel_registry, { profileId: null, componentId: null }));
  },
  showProfile: function(profileId) {
    this.setState({ profileId: profileId, componentId: null });
  },
  showComponent: function(componentId) {
    this.setState({ componentId: componentId, profileId: null})
  },
  render: function() {
    var profile = (this.state.profileId) ? <Profile profileId={this.state.profileId} /> : null;
    var component = (this.state.componentId) ? <Component componentId={this.state.componentId} /> : null;

    return (
      <div className="main">
        <SpaceSelector onSelect={this.handleSelect} />
        {profile || component}
        <DataTablesGrid type={this.state.type} filter={this.state.filter} multiple={false} profile={this.showProfile} component={this.showComponent} />
      </div>
    );
  }
});

module.exports = ComponentRegApp;
