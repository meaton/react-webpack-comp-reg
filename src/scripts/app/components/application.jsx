var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var DataGrid = require("./DataGrid.jsx");
var SpaceSelector = require("./SpaceSelector.jsx");

var Profile = require('./ProfileOverview');
// var Component = require('./ComponentOverview');

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("BrowserItemsStore", "BrowserSelectionStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      items: flux.store("BrowserItemsStore").getState(),
      selection: flux.store("BrowserSelectionStore").getState()
    };
  },

  render: function() {
    //TODO: get login state from UserStore/AuthStore -> validUserSession
    var item = this.state.selection.currentItem;
    var viewer =
     (!item)? null :
       (this.state.items.type == Constants.TYPE_PROFILE) ?
        <Profile
          ref="profile"
          profileId={item} />
        :null
        //TODO flux: component overview
        //:<Component ref="component" componentId={item} />

        // item: React.PropTypes.object,
        // xml: React.PropTypes.object,
        // comments: React.PropTypes.object,
        // loadXml: React.PropTypes.func

        console.log("current item: "+ item);
        console.log("viewer: "+ viewer);

    return (
      <section className="application-container">
        <div className="main container-fluid">
          <div className="browser row">
            <SpaceSelector
              type={this.state.items.type}
              space={this.state.items.space}
              multiSelect={this.state.selection.allowMultiple}
              validUserSession={false}
              onSpaceSelect={this.handleSpaceSelect}
              onToggleMultipleSelect={this.handleToggleMultipleSelect}
              onChange={this.clearInfo} />
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
    );
  },

  componentDidMount: function() {
    this.loadItems();
  },

  loadItems: function() {
    this.getFlux().actions.loadItems(this.state.items.type, this.state.items.space);
  },

  handleToggleMultipleSelect: function() {
    this.getFlux().actions.switchMultipleSelect();
  },

  handleSpaceSelect: function(space) {
    //TODO
  },

  handleRowSelect: function(val, target) {
    this.getFlux().actions.selectBrowserItem(val);
  }
});

module.exports = Application;
