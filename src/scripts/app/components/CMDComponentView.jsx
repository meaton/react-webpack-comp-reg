'use strict';

var log = require('loglevel');
var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');

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
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentView = React.createClass({
  mixins: [ImmutableRenderMixin, LinkedStateMixin],
  propTypes: {
    /* specification object (CMD_Component) */
    spec: React.PropTypes.object.isRequired,
    /* determines whether 'envelope' with properties should be hidden */
    hideProperties: React.PropTypes.bool,
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
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
  renderElement: function(elem, index, props) {
    //console.log('found elem (' + index + '): ' + elem);
    var elemId = (elem.elemId != undefined) ? elem.elemId : "comp_elem_" + md5.hash("comp_elem_" + elem['@name'] + "_" + index + "_" + Math.floor(Math.random()*1000));
    elem.elemId = elemId;
    return <CMDElementView key={elemId} spec={elem} />
  },
  renderAttribute: function(attr, index) {
    var attrId = (attr.attrId != undefined) ? attr.attrId : "comp_attr_" + md5.hash("comp_attr_" + index + "_" + Math.floor(Math.random()*1000));
    attr.attrId = attrId;
    return <CMDAttributeView key={attrId} spec={attr} />
  },
  renderNestedComponent: function(nestedComp, ncindex) {
    var isLinked = nestedComp.hasOwnProperty("@ComponentId");

    var compId;
    if(isLinked) {
      compId = nestedComp['@ComponentId'];
    } else if(nestedComp.Header != undefined) {
      compId = nestedComp.Header.ID;
    } else {
       compId =
         (nestedComp.inlineId != undefined)
           ? nestedComp.inlineId
           : "inline_" + md5.hash("inline_" + nestedComp['@name'] + "_" + ncindex + "_" + Math.floor(Math.random()*1000));
     }

    var newNestedComp = nestedComp;
    if(compId.startsWith("inline") && nestedComp.inlineId == undefined)
      newNestedComp = update(newNestedComp, { $merge: { inlineId: compId } });

    // use full spec for linked components if available (should have been preloaded)
    var linkedSpecAvailable = isLinked
                  && this.props.linkedComponents != undefined
                  && this.props.linkedComponents.hasOwnProperty(compId);

    var spec = linkedSpecAvailable ? this.props.linkedComponents[compId].CMD_Component : nestedComp;

    if(isLinked && !linkedSpecAvailable) {
      return <div>Component {compId} loading...</div>
    } else {
      // forward child expansion state
      return <CMDComponentView
        key={compId}
        spec={spec}
        parent={this.props.spec}
        expansionState={this.props.expansionState}
        linkedComponents={this.props.linkedComponents}
        onToggle={this.props.onToggle}
        />
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

    //console.log('render', this.constructor.displayName, (compId != null) ? compId : 'inline');

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
      compElems = compElems.map(self.renderElement);
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
      compComps = compComps.map(self.renderNestedComponent);
    }

    // classNames
    var viewClasses = classNames('componentBody', { 'hide': !self.isOpen() });
    var componentClasses = classNames('CMDComponent', { 'open': self.isOpen(), 'selected': this.props.isSelected });

    if(comp.AttributeList != undefined) {
      var attrSet = $.isArray(comp.AttributeList.Attribute) ? comp.AttributeList.Attribute : [comp.AttributeList.Attribute];
    }
    var attrList = (
      <div className="attrList">AttributeList:
        {
          (attrSet != undefined && attrSet.length > 0)
          ? $.map(attrSet, self.renderAttribute)
          : <span> No Attributes</span>
        }
      </div>
    );

    var children = (
      <div className={viewClasses}>
        {attrList}
        <div className="childElements">{compElems}</div>
        <div ref="components" className="childComponents">{compComps}</div>
      </div>
    );

    var title = (
      <div><span>Component: </span><a className="componentLink" onClick={this.toggleComponent}>{compName}</a></div>
    );

    if(!self.isOpen()) {
      return title;
    } else {
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
    }
  },

  isOpen: function() {
    return ExpansionState.isExpanded(this.props.expansionState, this.props.spec._appId);
  }
});

module.exports = CMDComponentView;
