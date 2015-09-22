'use strict';

var log = require('loglevel');
var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDElementView = require('./CMDElementView');
var CMDAttributeView = require('./CMDAttributeView');

//helpers
var ExpansionState = require('../service/ExpansionState');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/CMDComponent.sass');

/**
* CMDComponent - view display and editing form for a CMDI Component item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentView = React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    /* specification object (CMD_Component) */
    spec: React.PropTypes.object.isRequired,
    /* determines whether 'envelope' with properties should be hidden */
    hideProperties: React.PropTypes.bool,
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
    isLinked:  React.PropTypes.bool,
    expansionState: React.PropTypes.object,
    linkedComponents: React.PropTypes.object,
    onToggle: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      hideProperties: false,
      openAll: false,
      closeAll: false
    };
  },
  toggleComponent: function() {
    this.props.onToggle(this.props.spec._appId, this.props.spec);
  },
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
  render: function () {
    log.trace("Rendering", this.props.spec._appId, (this.isOpen()?"open":"closed"));

    var self = this;
    var props = this.props;
    var comp = this.props.spec;

    var compId;
    if(comp.hasOwnProperty("@ComponentId"))
      compId = comp["@ComponentId"];
    else if(comp.Header != undefined)
      compId = comp.Header.ID;
    else
      compId = null;

    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name']; // TODO: use @name attr only

    if(header != undefined && comp.CMD_Component != undefined)
      comp = comp.CMD_Component;

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);
    var compElems = comp.CMD_Element;

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    if(compElems != undefined) {
      // render elements
      compElems = compElems.map(function(elem, index){
        return (<CMDElementView key={elem._appId} spec={elem} />);
      });
    }

    if(!this.isOpen() && (compId != null && !comp.hasOwnProperty('@name') && this.props.componentName != null))
       compName = this.props.componentName;
    else if(comp.hasOwnProperty("@name"))
      compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined) {
      // render nested components
      var nestedComponents = compComps.map(self.renderNestedComponent);
    }

    // classNames
    var viewClasses = classNames('componentBody', { 'hide': !self.isOpen() });
    var componentClasses = classNames('CMDComponent', { 'open': self.isOpen(), 'selected': this.props.isSelected, 'linked': this.props.isLinked });

    if(comp.AttributeList != undefined) {
      var attrSet = $.isArray(comp.AttributeList.Attribute) ? comp.AttributeList.Attribute : [comp.AttributeList.Attribute];
    }
    var attrList = (
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

    var children = (
      <div className={viewClasses}>
        <div>{attrList}</div>
        <div className="childElements">{compElems}</div>
        <div ref="components" className="childComponents">{nestedComponents}</div>
      </div>
    );

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

    // if(!self.isOpen()) {
    //   return title;
    // } else {
      if(this.props.hideProperties) {
        //skip 'envelope', only show child components, elements, attributes
        return children;
      } else {
        // envelope with properties and children
        return (
          <div className={componentClasses}>
            {title}
            <div className="componentProps">{compProps}</div>
            {children}
          </div>
        );
      }
    // }
  },

  isOpen: function() {
    return !this.props.isLinked || ExpansionState.isExpanded(this.props.expansionState, this.props.spec._appId);
  }
});

module.exports = CMDComponentView;
