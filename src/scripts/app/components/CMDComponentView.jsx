'use strict';

var log = require('loglevel');
var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../mixins/CMDComponentMixin');

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
  mixins: [ImmutableRenderMixin, CMDComponentMixin],

  renderNestedComponent: function(nestedComp, ncindex) {
    var isLinked = nestedComp.hasOwnProperty("@ComponentId");
    if(isLinked) {
      var compId = nestedComp['@ComponentId'];
    }

    // use full spec for linked components if available (should have been preloaded)
    var linkedSpecAvailable = isLinked
                  && this.props.linkedComponents != undefined
                  && this.props.linkedComponents.hasOwnProperty(compId);

    var spec = linkedSpecAvailable ? this.props.linkedComponents[compId].CMD_Component : nestedComp;

    // component ID (for display purposes only)
    if(!isLinked) {
       var compId = spec._appId;
    }

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
  renderAttributes: function(comp) {
    if(comp.AttributeList != undefined) {
      var attrSet = $.isArray(comp.AttributeList.Attribute) ? comp.AttributeList.Attribute : [comp.AttributeList.Attribute];
    }
    return (
      <div className="attrList">AttributeList:
        {
          (attrSet != undefined && attrSet.length > 0)
          ? $.map(attrSet, function(attr, index) {
            return (<CMDAttributeView key={attr._appId} spec={attr} />);
          })
          : <span>No Attributes</span>
        }
      </div>
    );
  },
  renderElements: function(comp) {
    var compElems = comp.CMD_Element;

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    if(compElems != undefined) {
      // render elements
      return compElems.map(function(elem, index){
        return (<CMDElementView key={elem._appId} spec={elem} />);
      });
    }
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
        <div><span>Component: </span><a className="componentLink" onClick={this.toggleComponent}>{compName}</a></div>
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
