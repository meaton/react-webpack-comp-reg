'use strict';

var React = require('react/addons');
var State = require('react-router').State;
var Authentication = require('./Authentication.jsx').Authentication;
var Profile = require('./ProfileOverview.jsx');
var Component = require('./ComponentOverview.jsx');
var SpaceSelector = require('./SpaceSelector.jsx');
var DataTablesGrid = require('./DataTablesGrid.jsx');
var DataTablesBtnGroup = require('./BtnMenuGroup.jsx');
var btnMenuGroup = require('../mixins/BtnGroupEvents');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

require('../../styles/ComponentEditor.sass');

var ComponentRegApp = React.createClass({
  mixins: [btnMenuGroup, React.addons.LinkedStateMixin, State],
  contextTypes: {
    loggedIn: React.PropTypes.bool.isRequired
  },
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
  componentWillMount: function() {
    console.log('component will mount');
    if(this.context.router != null && Object.keys(this.getQuery()).length > 0) {
      console.log('query: ' + JSON.stringify(this.getQuery()));
      this.setState(this.getQuery);
    }
  },
  render: function() {
    //TODO insert draggable bar and have dragEvents change grid and viewer CSS style dimensons
    //TODO use datatable toolbar custom DOM with insertion of BtnMenuGroup
    return (
      <div className="main container-fluid">
        <div className="browser row">
          <SpaceSelector type={this.state.type} filter={this.state.filter} onSelect={this.handleSelect} multiSelect={this.linkState("multiSelect")} validUserSession={this.context.loggedIn} onChange={this.clearInfo} />
          <DataTablesBtnGroup { ...this.getBtnGroupProps() } />
          <DataTablesGrid ref="grid" type={this.state.type} filter={this.state.filter} multiple={this.linkState("multiSelect")} profile={this.showProfile} component={this.showComponent} />
        </div>
        <div className="viewer row">
          <Profile ref="profile" profileId={this.state.profileId} />
          <Component ref="component" componentId={this.state.componentId} />
        </div>
      </div>
    );
  }
});

module.exports = ComponentRegApp;
