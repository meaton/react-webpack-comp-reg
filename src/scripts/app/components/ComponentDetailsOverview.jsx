'use strict';

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

//components
var InfoPanel = require('./InfoPanel.jsx');

/**
* ComponentDetailsOverview - displays the loaded CMDI Profile, full schema and comments in Bootstrap tabbed-panes.
* @constructor
* @mixes Loader
* @mixes LoadingMixin
*/
var ComponentDetailsOverview = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ComponentDetailsStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      details: flux.store("ComponentDetailsStore").getState()
    };
  },

  propTypes: {
    item: React.PropTypes.object,
    type: React.PropTypes.string,
    space: React.PropTypes.string
  },

  loadSpec: function () {
    this.getFlux().actions.loadComponentSpec(this.props.type, this.props.space, this.props.item);
  },

  loadXml: function () {
    this.getFlux().actions.loadComponentSpecXml(this.props.type, this.props.space, this.props.item);
  },
  toggleComponent: function(itemId, spec) {
    // expand view
    this.getFlux().actions.toggleItemExpansion(itemId);
    // load child components of expanded item
    this.getFlux().actions.loadLinkedComponentSpecs(spec, this.props.space);
  },

  render: function() {
    var hideClass = (this.props.item != null) ? "show" : "hide";
    var infoPanel = (this.props.item != null) ?
      <InfoPanel  item={this.props.item}
                  activeView={this.state.details.activeView}
                  spec={this.state.details.spec}
                  specXml={this.state.details.xml}
                  comments={this.state.details.comments}
                  commentsHandler={this.commentsHandler}
                  loadSpec={this.loadSpec}
                  loadSpecXml={this.loadXml}
                  className={this.state.details.loading?" wait":""}
                  expansionState={this.state.details.expansionState}
                  linkedComponents={this.state.details.linkedComponents}
                  onComponentToggle={this.toggleComponent}
      />
      : null;


    var error = (this.state.details.errorMessage != null) ?
      <p className="error">{this.state.details.errorMessage}</p>
      :null;

    return (
      <div className={hideClass}>
        {infoPanel}
        {error}
      </div>
    );
  }

});

module.exports = ComponentDetailsOverview;
