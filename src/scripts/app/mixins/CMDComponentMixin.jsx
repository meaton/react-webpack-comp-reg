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
      var nestedComponents = compComps.map(self.renderNestedComponent);
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
