'use strict';

var React = require('react/addons');
var Router = require('react-router');

//mixins
var btnMenuGroup = require('../mixins/BtnGroupEvents');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

//components
var Profile = require('./ProfileOverview');
var Component = require('./ComponentOverview');
var SpaceSelector = require('./SpaceSelector');
var DataTablesGrid = require('./DataTablesGrid');
var DataTablesBtnGroup = require('./BtnMenuGroup');

//utils
var update = React.addons.update;

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

require('../../styles/ComponentEditor.sass');

/**
* ComponentRegApp - default application component containing a browser and viewer for CMDI profiles or components.
* @constructor
* @mixes React.addons.LinkedStateMixin
* @mixes Router.State
* @mixes BtnGroupEvents
*/
var ComponentRegApp = React.createClass({
  mixins: [React.addons.LinkedStateMixin, Router.State, btnMenuGroup],
  contextTypes: {
    loggedIn: React.PropTypes.bool.isRequired
  },
  childContextTypes: {
      itemId: React.PropTypes.string
  },
  getInitialState: function() {
    return { filter: "published", type: "profiles", profileId: null, componentId: null, multiSelect: false };
  },
  getChildContext: function() {
       return { itemId: this.state.profileId || this.state.componentId };
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
  showAlert: function(title, desc, onRequestHide) {
    var instance = (
      <Modal title={title}
        enforceFocus={true}
        backdrop={true}
        animation={false}
        container={this}
        onRequestHide={(onRequestHide) ? onRequestHide : this.closeAlert.bind(this, "alert-container")}>
        <div className="modal-body">
          <div className="modal-desc">{desc}</div>
        </div>
        <div className="modal-footer">
          <Button onClick={(onRequestHide) ? onRequestHide : this.closeAlert.bind(this, "alert-container")} bsStyle="primary">Close</Button>
        </div>
      </Modal>
    );

    this.renderAlert(instance, "alert-container");
  },
  handleUsageErrors: function(errors) {
    var self = this;
    var errors = this.processUsageErrors(errors, React.DOM.li); // replace errors array with React.DOM.li array, text() containing profile name

    var alertMsgDesc = "The component(s) cannot be deleted because it is used by the following component(s) and/or profile(s):";
    var alertMsg = (
      <div>{alertMsgDesc}
        <ul>{errors}</ul>
      </div>
    );

    if(errors.length > 0)
      this.showAlert("Component is used", alertMsg, function(evt) {
        self.refs.grid.removeSelected(errors.length != $('#testtable tr.selected').length);
        self.closeAlert("alert-container", evt);
      });
    else
      this.refs.grid.removeSelected(true);
  },
  componentWillMount: function() {
    console.log(this.constructor.displayName, 'will mount');
    //TODO regex match profileId/componentId values
    if(this.context.router != null && Object.keys(this.getQuery()).length > 0) {
      var queryObj = this.getQuery();

      console.log('query params: ' + JSON.stringify(queryObj));

      if(queryObj.registrySpace != undefined && queryObj.registrySpace.length > 0) {
        // backward-compat legacy flex-application urls
        if(queryObj.itemId) { //TODO regex match itemId value
          var itemValues = queryObj.itemId.split(':');
          var type = null;

          if(itemValues.length >= 3)
            if(itemValues[2].indexOf('c') == 0)
              type = "components";
            else if(itemValues[2].indexOf('p') == 0)
              type = "profiles";

          if(type != null) {
            this.setState(function() {
              if(type == "components")
                return { filter: queryObj.registrySpace, type: type, componentId: queryObj.itemId };
              else if(type == "profiles")
                return { filter: queryObj.registrySpace, type: type, profileId: queryObj.itemId }

              return { filter: queryObj.registrySpace, type: type };
            });
          }
        } else
          this.setState(function() {
            if(queryObj.profileId)
              return { filter: queryObj.registrySpace, type: "profiles", profileId: queryObj.profileId };
            else if(queryObj.componentId)
              return { filter: queryObj.registrySpace, type: "components", componentId: queryObj.componentId };
            else
              return { filter: queryObj.registrySpace };
          });
      } else
        this.setState(function() {
          if(queryObj.profileId)
            queryObj = update(queryObj, { $merge: { type: "profiles" }});
          else if(queryObj.componentId)
            queryObj = update(queryObj, { $merge: { type: "components" }});
          return update(this.state, { filter: { $set: queryObj.filter }, type:  { $set: queryObj.type }, profileId: { $set: (queryObj.profileId && queryObj.type === "profiles") ? queryObj.profileId : null }, componentId: { $set: (queryObj.componentId && queryObj.type === "components") ? queryObj.componentId : null } });
        });
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
        <div id="alert-container" />
      </div>
    );
  }
});

module.exports = ComponentRegApp;
