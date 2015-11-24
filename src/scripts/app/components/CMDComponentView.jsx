'use strict';

var log = require('loglevel');
var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../mixins/CMDComponentMixin');
var ToggleExpansionMixin = require('../mixins/ToggleExpansionMixin');


//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDElementView = require('./CMDElementView');
var CMDAttributeView = require('./CMDAttributeView');

//utils
var update = React.addons.update;
var md5 = require('spark-md5');

require('../../../styles/CMDComponent.sass');

/**
* CMDComponent - view display and editing form for a CMDI Component item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentView = React.createClass({
  mixins: [ImmutableRenderMixin, CMDComponentMixin, ToggleExpansionMixin],
  propTypes: {
    onComponentChange: React.PropTypes.func.isRequired
    /* more props defined in CMDComponentMixin, ToggleExpansionMixin and ActionButtonsMixin */
  },

  /**
   * Components should be closed by default iff they are linked
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return !this.props.isLinked;
  },

  renderNestedComponent: function(spec, compId, isLinked, linkedSpecAvailable) {
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

    if(!this.isOpen() && (compId != null && !comp.hasOwnProperty('@name') && this.props.componentName != null))
       compName = this.props.componentName;
    else if(comp.hasOwnProperty("@name"))
      compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];

    var title;
    if(this.props.isLinked) {
      title = (
        <div><span>Component: </span><a className="componentLink" onClick={this.toggleExpansionState}>{compName}</a></div>
      )
    } else {
      title = (
        <div><span>Component: </span><span className="componentName">{compName}</span></div>
      )
    }

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);

    return (
      <div>
        {title}
        <div className="componentProps">{compProps}</div>
      </div>
    );
  }
});

module.exports = CMDComponentView;
