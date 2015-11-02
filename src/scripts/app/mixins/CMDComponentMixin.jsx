'use strict';

var log = require('loglevel');

//helpers
var ExpansionState = require('../service/ExpansionState');
var classNames = require('classnames');

/**
* CMDComponentMixin - Common functions and properties for the CMDComponent view
* and form components, mostly related to expansion state
* @mixin
*/
var CMDComponentMixin = {
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

  isOpen: function() {
    return !this.props.isLinked || ExpansionState.isExpanded(this.props.expansionState, this.props.spec._appId);
  },

  renderAttributes: function(comp) {
    if(comp.AttributeList != undefined) {
      var attrSet = $.isArray(comp.AttributeList.Attribute) ? comp.AttributeList.Attribute : [comp.AttributeList.Attribute];
    }

    var self = this;
    return (
      <div className="attrList">AttributeList:
        {
          (attrSet != undefined && attrSet.length > 0)
          ? $.map(attrSet, function(attr, index) {
            return this.renderAttribute(attr); //(<CMDAttributeForm key={attr._appId} spec={attr} />);
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
      var self = this;
      // render elements
      return compElems.map(function(elem, index){
        return self.renderElement(elem); //(<CMDElementForm key={elem._appId} spec={elem} />);
      });
    }
  },

  callRenderNestedComponent: function(nestedComp, ncindex) {
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

    return this.renderNestedComponent(spec, compId, isLinked, linkedSpecAvailable, ncindex);
  },

  render: function () {
    log.trace("Rendering", this.props.spec._appId, (this.isOpen()?"open":"closed"));

    var self = this;
    var props = this.props;
    var comp = this.props.spec;

    var header = comp.Header;
    if(header != undefined && comp.CMD_Component != undefined)
      comp = comp.CMD_Component;

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined) {
      // render nested components
      var nestedComponents = compComps.map(self.callRenderNestedComponent);
    }

    // classNames
    var viewClasses = classNames('componentBody', { 'hide': !self.isOpen() });
    var componentClasses = classNames('CMDComponent', { 'open': self.isOpen(), 'selected': this.props.isSelected, 'linked': this.props.isLinked });

    var children = (
      <div className={viewClasses}>
        <div>{this.renderAttributes(comp)}</div>
        <div className="childElements">{this.renderElements(comp)}</div>
        <div ref="components" className="childComponents">{nestedComponents}</div>
      </div>
    );

    if(this.props.hideProperties) {
      //skip 'envelope', only show child components, elements, attributes
      return children;
    } else {
      // envelope with properties and children
      return (
        <div className={componentClasses}>
          {this.renderComponentProperties(comp)}
          {children}
        </div>
      );
    }
  }
}

module.exports = CMDComponentMixin;
