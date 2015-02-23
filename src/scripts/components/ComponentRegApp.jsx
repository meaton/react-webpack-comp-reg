/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons');
var Authentication = require('./Authentication.jsx').Authentication;
var Profile = require('./ProfileOverview.jsx');
var Component = require('./ComponentOverview.jsx');
var SpaceSelector = require('./SpaceSelector.jsx');
var DataTablesGrid = require('./DataTablesGrid.jsx');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

var ComponentRegApp = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  //mixins: [ Authentication, React.addons.LinkedStateMixin ], //TODO: enable linked state mixins to tie state variable (currentSelectedItem) to children component properties
  getInitialState: function() {
    return { filter: "published", type: "profiles", profileId: null, componentId: null, multiSelect: false };
  },
  handleSelect: function(sel_registry) {
    this.setState({ type: sel_registry.type.toLowerCase(), filter: sel_registry.filter, profileId: null, componentId: null });
  },
  showProfile: function(profileId) {
    this.setState({ profileId: profileId, componentId: null });
  },
  showComponent: function(componentId) {
    this.setState({ componentId: componentId, profileId: null })
  },
  clearInfo: function() {
    this.setState({profileId: null, componentId: null})
  },
  render: function() {
    return (
      <div className="main">
        <SpaceSelector onSelect={this.handleSelect} multiSelect={this.linkState("multiSelect")} onChange={this.clearInfo} />
        <DataTablesGrid type={this.state.type} filter={this.state.filter} multiple={this.linkState("multiSelect")} profile={this.showProfile} component={this.showComponent} />
        <Profile profileId={this.state.profileId} />
        <Component componentId={this.state.componentId} />
      </div>
    );
  }
});

module.exports = ComponentRegApp;
