'use strict';

var React = require("react");

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
    /* specification object (Component) */
    spec: React.PropTypes.object.isRequired,
    /* determines whether 'envelope' with properties should be hidden */
    hideProperties: React.PropTypes.bool,
    isLinked:  React.PropTypes.bool,
    linkedComponents: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      hideProperties: false
    };
  },

  /*=== Render functions ===*/

  render: function () {
    var open = this.isOpen();
    log.trace("Rendering", this.props.spec._appId, (open?"open":"closed"));

    var props = this.props;
    var comp = this.props.spec;
    var status = (this.props.header != undefined)? this.props.header.Status : "unknown";

    var header = comp.Header;
    if(header != undefined && comp.Component != undefined) {
      comp = comp.Component;
    }

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    // classNames
    var viewClasses = classNames('componentBody', {'panel-group': open});
    var componentClasses = classNames('CMDComponent ' + 'status-' + status,
      { 'open': open, 'selected': (this.isSelected && this.isSelected()), 'linked': this.props.isLinked });

    var beforeChildren;
    if(typeof this.renderBeforeChildren == "function") {
      beforeChildren = this.renderBeforeChildren();
    } else {
      beforeChildren = null;
    }

    var children = (open || this.props.renderChildrenWhenCollapsed)?(
      <div className={viewClasses}>
          {beforeChildren}
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
          {this.renderComponentProperties(comp)}
          {children}
        </div>
      );
    }
  },

  /* Rendering of components */

  renderNestedComponents: function(comp) {
      var compComps = comp.Component;

      if(!$.isArray(compComps) && compComps != undefined)
        compComps = [compComps];

      var nestedComponents;
      if(compComps != undefined) {
        // render nested components
        nestedComponents = compComps.map(this.callRenderNestedComponent);
      } else {
        nestedComponents = null;
      }

      if(this.wrapNestedComponents) {
        nestedComponents = this.wrapNestedComponents(nestedComponents);
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
    var isLinked = nestedComp.hasOwnProperty("@ComponentRef");
    if(isLinked) {
      var compId = nestedComp['@ComponentRef'];
    }

    // use full spec for linked components if available (should have been preloaded)
    var linkedSpecAvailable = isLinked
                  && this.props.linkedComponents != undefined
                  && this.props.linkedComponents.hasOwnProperty(compId);

    var compSpec = linkedSpecAvailable ? this.props.linkedComponents[compId].Component : nestedComp;
    var header = linkedSpecAvailable ? this.props.linkedComponents[compId].Header : null;

    // component ID (for display purposes only)
    if(!isLinked) {
       var compId = compSpec._appId;
    }

    return this.renderNestedComponent(compSpec, header, compId, isLinked, linkedSpecAvailable, ncindex);
  },

  /* Rendering of elements */

  renderElements: function(comp) {
    var compElems = comp.Element;

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    var elements;
    if(compElems != undefined) {
      // render elements
      elements = compElems.map(this.renderElement);
    } else {
      elements = null;
    }

    if(this.wrapElements) {
      elements = this.wrapElements(elements);
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

    var attributes = (attrSet != undefined && attrSet.length > 0) ?
      $.map(attrSet, this.renderAttribute)
      :null;

    if(this.wrapAttributes) {
      attributes = this.wrapAttributes(attributes);
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
            <div className="attrList">
              {attributes}
            </div>
          {afterAttributes}
      </div>
    );
  }
}

module.exports = CMDComponentMixin;
