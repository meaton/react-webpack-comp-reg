'use strict';

var React = require('react/addons');
var Router = require('react-router');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');
var btnGroup = require('../../mixins/BtnGroupEvents');
var ValidationMixin = require('../../mixins/ValidationMixin');

//components
var CMDComponentView = require('./CMDComponentView');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/ComponentViewer.sass');

/**
* ComponentViewer - view display for a CMDI Profile or Component item and its root properties, nested Components (CMDComponent), Elements, (CMDElement) and Attributes (CMDAttribute).
* @constructor
* @mixes ImmutableRenderMixin
* @LinkedStateMixin
* @BtnGroupEvents
* @Loader
* @ValidationMixin
* @Router.Navigation
* @Router.State
*/
var ComponentSpec = React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired,
    spec: React.PropTypes.object.isRequired
    //TODO: property to skip header (for root component)
  },
  contextTypes: {
    router: React.PropTypes.func,
  },
  getInitialState: function() {
    return { childElements: null,
             childComponents: null
    };
  },
  mixins: [
    //ImmutableRenderMixin,
    LinkedStateMixin,
    btnGroup, ValidationMixin, Router.Navigation, Router.State],

  getDefaultProps: function() {
    return {
      domains: require('../../domains.js')
    };
  },
//TODO flux: get rid of 'parsing' (in this component)
  componentWillUpdate: function(nextProps, nextState) {
    console.log(this.constructor.displayName, 'will update');
    var self = this;
    var newItem = nextProps.spec;
    var prevItem = this.props.spec;

    if(newItem != null && nextState.childComponents == null && nextState.childElements == null) {
      if(newItem.CMD_Component.AttributeList != undefined && !$.isArray(newItem.CMD_Component.AttributeList.Attribute))
        newItem = update(newItem, { CMD_Component: { AttributeList: { Attribute: { $set: [newItem.CMD_Component.AttributeList.Attribute] } }}});

      this.parseComponent(newItem, nextState);
    }
  },

  parseComponent: function(item, state) {
    console.log('parseComponent');

    var rootComponent = item.CMD_Component;
    var childComponents = (!$.isArray(rootComponent.CMD_Component) && rootComponent.CMD_Component != null) ? [rootComponent.CMD_Component] : (rootComponent.CMD_Component||[]);
    var childElements = (!$.isArray(rootComponent.CMD_Element) && rootComponent.CMD_Element != null) ? [rootComponent.CMD_Element] : (rootComponent.CMD_Element||[]);

    console.log('child item components: ' + childComponents.length);
    console.log('child item elements: ' + childElements.length);

    if(childElements.length >= 1)
      console.log('first item element: ' + childElements[0]['@name']);

    for(var i=0; i < childComponents.length; i++)
      if(childComponents[i].hasOwnProperty("@ComponentId"))
      {
        //TODO flux: allow for expansion of linked component (through action)
      }
        // this.loadComponent(childComponents[i]["@ComponentId"], "json", function(data) {
        //     console.log('data child comp: ' + (data.CMD_Component != null));
        //     data.CMD_Component = update(data.CMD_Component, { $merge: {'@CardinalityMin': (childComponents[i].hasOwnProperty("@CardinalityMin")) ? childComponents[i]["@CardinalityMin"] : 1, '@CardinalityMax': (childComponents[i].hasOwnProperty("@CardinalityMax")) ? childComponents[i]["@CardinalityMax"] : 1}})
        //     childComponents[i] = update(data, {open: {$set: state.editMode}});
        // });
      else {
        var isInlineComponent = (childComponents[i].Header == undefined);
        childComponents[i] = update(childComponents[i], {open: {$set: (state.editMode || isInlineComponent)}})
        console.log('childComponent: ' + JSON.stringify(childComponents[i]));
      }

    this.setState({ childElements: childElements, childComponents: childComponents,
      //profile: (item['@isProfile'] === "true") ? item : state.profile,
      //component: (item['@isProfile'] === "true") ? state.component : item,
      registry: state.registry });
  },
  printProperties: function(item) {
    var self = this;
    var rootComponent = item.CMD_Component;

    // Display properties
    var conceptLink = (rootComponent && rootComponent['@ConceptLink'] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent['@ConceptLink']}>{rootComponent['@ConceptLink']}</a></li> : null;
    return (
      <ul>
        <li><span>Name:</span> <b>{item.Header.Name}</b></li>
        <li><span>Description:</span> {item.Header.Description}</li>
        {conceptLink}
      </ul>
    );
  },
  render: function() {
    var self = this;
    var item = this.props.spec;

    if(item == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else {
      var rootClasses = classNames({ ComponentViewer: true });
      return (
          <div className={rootClasses}>
            {/*errors*/}
            <div className="rootProperties">
              {this.printProperties(item)}
            </div>
            {/*attrList*/}
            {/*childElem*/}
            {/*childComp*/}
            <CMDComponentView spec={item.CMD_Component} />
          </div>
        );
    }
  }
});

module.exports = ComponentSpec;
