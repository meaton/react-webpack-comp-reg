'use strict';

var React = require('react/addons');
var Authentication = require('./Authentication.jsx').Authentication;
var Profile = require('./ProfileOverview.jsx');
var Component = require('./ComponentOverview.jsx');
var SpaceSelector = require('./SpaceSelector.jsx');
var DataTablesGrid = require('./DataTablesGrid.jsx');
var DataTablesBtnGroup = require('./BtnMenuGroup.jsx');
var btnMenuGroup = require('../mixins/BtnGroupEvents');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

var ComponentRegApp = React.createClass({
  mixins: [btnMenuGroup, React.addons.LinkedStateMixin],
  //mixins: [ Authentication ],
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
    //TODO insert draggable bar and have dragEvents change grid and viewer CSS style dimensons
    return (
      <div className="main">
        <SpaceSelector onSelect={this.handleSelect} multiSelect={this.linkState("multiSelect")} onChange={this.clearInfo} />
        <DataTablesBtnGroup { ...this.getBtnGroupProps() } />
        <DataTablesGrid ref="grid" type={this.state.type} filter={this.state.filter} multiple={this.linkState("multiSelect")} profile={this.showProfile} component={this.showComponent} />
        <Profile ref="profile" profileId={this.state.profileId} />
        <Component ref="component" componentId={this.state.componentId} />
      </div>
    );
  }
});

module.exports = ComponentRegApp;
