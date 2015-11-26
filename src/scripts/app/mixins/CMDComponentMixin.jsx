'use strict';

var log = require('loglevel');

//helpers
var classNames = require('classnames');

/**
* CMDComponentMixin - Common functions and properties for the CMDComponent view
* and form components
* @mixin
*/
var CMDComponentMixin = {
  propTypes: {
    /* specification object (CMD_Component) */
    spec: React.PropTypes.object.isRequired,
    /* determines whether 'envelope' with properties should be hidden */
    hideProperties: React.PropTypes.bool,
    isLinked:  React.PropTypes.bool,
    linkedComponents: React.PropTypes.object,
    actionButtons: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      hideProperties: false,
      actionButtons: null
    };
  },

  /*=== Render functions ===*/

  render: function () {
    var open = this.isOpen();
    log.trace("Rendering", this.props.spec._appId, (open?"open":"closed"));

    var props = this.props;
    var comp = this.props.spec;

    var header = comp.Header;
    if(header != undefined && comp.CMD_Component != undefined)
      comp = comp.CMD_Component;

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    // classNames
    var viewClasses = classNames('componentBody');
    var componentClasses = classNames('CMDComponent', { 'open': open, 'selected': (this.isSelected && this.isSelected()), 'linked': this.props.isLinked });

    var children = (open || this.props.renderChildrenWhenCollapsed)?(
      <div className={viewClasses}>
        <div>{this.renderAttributes(comp)}</div>
        <div className="childElements">{this.renderElements(comp)}</div>
        <div ref="components" className="childComponents">{this.renderNestedComponents(comp)}</div>
      </div>
    ):null;

    if(this.props.hideProperties) {
      //skip 'envelope', only show child components, elements, attributes
      return children;
    } else {
      // envelope with properties and children
      return (
        <div className={componentClasses}>
          {this.props.actionButtons}
          {this.renderComponentProperties(comp)}
          {children}
        </div>
      );
    }
  },

  /* Rendering of components */

  renderNestedComponents: function(comp) {
      var compComps = comp.CMD_Component;

      if(!$.isArray(compComps) && compComps != undefined)
        compComps = [compComps];

      var nestedComponents;
      if(compComps != undefined) {
        // render nested components
        nestedComponents = compComps.map(this.callRenderNestedComponent);
      } else {
        nestedComponents = null;
      }

      var afterComponents;
      if(typeof this.renderAfterComponents == "function") {
        afterComponents = this.renderAfterComponents();
      } else {
        afterComponents = null;
      }

      return (
        <div className="components">
          {nestedComponents}
          {afterComponents}
        </div>
      );
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

  /* Rendering of elements */

  renderElements: function(comp) {
    var compElems = comp.CMD_Element;

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    var elements;
    if(compElems != undefined) {
      // render elements
      elements = compElems.map(this.renderElement);
    } else {
      elements = null;
    }

    var afterElements;
    if(typeof this.renderAfterElements == "function") {
      afterElements = this.renderAfterElements();
    } else {
      afterElements = null;
    }

    return (
      <div className="elements">
        {elements}
        {afterElements}
      </div>
    );
  },

  /* Rendering of attributes */

  renderAttributes: function(comp) {
    if(comp.AttributeList != undefined) {
      var attrSet = $.isArray(comp.AttributeList.Attribute) ? comp.AttributeList.Attribute : [comp.AttributeList.Attribute];
    }

    var afterAttributes;
    if(typeof this.renderAfterAttributes == "function") {
      afterAttributes = this.renderAfterAttributes();
    } else {
      afterAttributes = null;
    }

    var self = this;
    return (
      <div>
        {(attrSet != undefined && attrSet.length > 0)? (
          <div className="attrList">
            Attributes:
            {$.map(attrSet, this.renderAttribute)}
          </div>
        ):null}
        {afterAttributes}
      </div>
    );
  }
}

module.exports = CMDComponentMixin;
