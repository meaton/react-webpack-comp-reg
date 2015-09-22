var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

// Components
var AuthState = require("./AuthState.jsx");
var DataGrid = require("./DataGrid.jsx");
var SpaceSelector = require("./SpaceSelector.jsx");
var ComponentDetails = require('./ComponentDetailsOverview');

// Boostrap
var PageHeader = require('react-bootstrap/lib/PageHeader');

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("BrowserItemsStore", "BrowserSelectionStore", "ComponentDetailsStore", "AuthenticationStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("BrowserItemsStore").getState(),
      selection: flux.store("BrowserSelectionStore").getState(),
      details: flux.store("ComponentDetailsStore").getState(),
      auth: flux.store("AuthenticationStore").getState()
    };
  },

  render: function() {
    var item = this.state.selection.currentItem;
    var viewer =
     (!item)? null :
        <ComponentDetails
          ref="details"
          item={item}
          type={this.state.items.type}
          space={this.state.items.space}
          />
    return (
      <div>
        <PageHeader>CMDI Component Registry <small>React.js Prototype beta</small></PageHeader>

        <div className="auth-login">
          <AuthState
            authState={this.state.auth.authState}
            onLogin={this.handleLogin} />
        </div>

        <section className="application-container">
          <div className="main container-fluid">
            <div className="browser row">
              <SpaceSelector
                type={this.state.items.type}
                space={this.state.items.space}
                multiSelect={this.state.selection.allowMultiple}
                validUserSession={false /*TODO flux: pass auth state */}
                onSpaceSelect={this.handleSpaceSelect}
                onToggleMultipleSelect={this.handleToggleMultipleSelect} />
              {/*TODO: <DataTablesBtnGroup { ...this.getBtnGroupProps() } />*/}
              <DataGrid
                items={this.state.items.items}
                selectedItems={this.state.selection.selectedItems}
                loading={this.state.items.loading}
                errorMessage={this.state.items.errorMessage}
                multiSelect={this.state.selection.allowMultiple}
                editMode={false}
                onReload={this.loadItems}
                onRowSelect={this.handleRowSelect}
                />
            </div>
            <div className="viewer row">
              {viewer}
            </div>
            <div id="alert-container" /></div>
        </section>
      </div>
    );
  },

  componentDidMount: function() {
    this.checkAuthState();
    // check auth state every 30s
    this.authInterval = setInterval(this.checkAuthState, 30*1000);

    this.loadItems();
  },

  componentWillUnmount: function() {
    clearInterval(this.authInterval);
  },

  loadItems: function() {
    this.getFlux().actions.loadItems(this.state.items.type, this.state.items.space);
  },

  handleToggleMultipleSelect: function() {
    this.getFlux().actions.switchMultipleSelect();
  },

  handleSpaceSelect: function(type, registry) {
    this.getFlux().actions.switchSpace(type, registry);
    this.getFlux().actions.loadItems(type, registry);
  },

  handleRowSelect: function(val, target) {
    this.getFlux().actions.selectBrowserItem(val);

    // update the info view
    if(this.state.details.activeView == Constants.INFO_VIEW_SPEC) {
      this.getFlux().actions.loadComponentSpec(this.state.items.type, this.state.items.space, val);
    }
    if(this.state.details.activeView == Constants.INFO_VIEW_XML) {
      this.getFlux().actions.loadComponentSpecXml(this.state.items.type, this.state.items.space, val);
    }
    //TODO flux: comments
  },

  handleLogin: function() {
    this.getFlux().actions.login();
  },

  checkAuthState: function() {
    this.getFlux().actions.checkAuthState();
  }
});

module.exports = Application;
