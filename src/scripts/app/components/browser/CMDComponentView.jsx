'use strict';

var log = require('loglevel');
var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../../mixins/CMDComponentMixin');
var ToggleExpansionMixin = require('../../mixins/ToggleExpansionMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDElementView = require('./CMDElementView');
var CMDAttributeView = require('./CMDAttributeView');
var ActionButtons = require('../editor/ActionButtons');

//utils
var update = require('react-addons-update');;
var md5 = require('spark-md5');

require('../../../../styles/CMDComponent.sass');

/**
* CMDComponent - view display and editing form for a CMDI Component item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentView = React.createClass({
  mixins: [ImmutableRenderMixin, CMDComponentMixin, ToggleExpansionMixin, ActionButtonsMixin],

  /* props defined in CMDComponentMixin, ToggleExpansionMixin and ActionButtonsMixin */

  /**
   * Components should be closed by default iff they are linked
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return !this.props.isLinked;
  },

  renderNestedComponent: function(spec, compId, isLinked, linkedSpecAvailable, index) {
    if(isLinked && !linkedSpecAvailable) {
      return (<div key={compId}>Component {compId} loading...</div>);
    } else {
      // forward child expansion state
      return (<CMDComponentView
        key={spec._appId}
        spec={spec}
        parent={this.props.spec}
        expansionState={this.props.expansionState}
        linkedComponents={this.props.linkedComponents}
        onToggle={this.props.onToggle}
        isLinked={isLinked}
        onMove={this.props.editMode && this.handleMoveComponent.bind(this, this.props.onComponentChange, index)}
        onRemove={this.props.editMode && this.handleRemoveComponent.bind(this, this.props.onComponentChange, index)}
        isFirst={index == 0}
        isLast={index == this.props.spec.CMD_Component.length - 1}
        actionButtons={isLinked ?
          <ActionButtons
            onToggleExpansion={this.toggleExpansionStateOf.bind(this, spec, !isLinked)}
            isExpanded={this.isOpen(spec, !isLinked)}/>:null}
        />);
    }
  },

  renderAttribute: function(attr) {
    return (<CMDAttributeView key={attr._appId} spec={attr} />);
  },

  renderElement: function(elem) {
    return (<CMDElementView key={elem._appId} spec={elem} />);
  },

  renderComponentProperties: function(comp) {
    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name']; // TODO: use @name attr only

    var compId;
    if(comp.hasOwnProperty("@ComponentId"))
      compId = comp["@ComponentId"];
    else if(comp.Header != undefined)
      compId = comp.Header.ID;
    else
      compId = null;

    var open = this.isOpen();

    if(!open && (compId != null && !comp.hasOwnProperty('@name') && this.props.componentName != null))
       compName = this.props.componentName;
    else if(comp.hasOwnProperty("@name"))
      compName = comp['@name'];

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    var cardinality = (<span>Cardinality: {minC + " - " + maxC}</span>);

    var title;
    if(this.props.isLinked) {
      title = (
        <div className="panel-heading">
          {this.props.actionButtons}
          <span>Component: </span><a className="componentLink" onClick={this.toggleExpansionState}>{compName}</a> {!open && cardinality}
        </div>
      )
    } else {
      title = (
        <div className="panel-heading">
          {this.props.actionButtons}
          <span>Component: </span><span className="componentName">{compName}</span>
        </div>
      )
    }

    return (
      <div className="panel panel-info">
        {title}
        {open &&<div className="panel-body componentProps">{cardinality}</div>}
      </div>
    );
  }
});

module.exports = CMDComponentView;
