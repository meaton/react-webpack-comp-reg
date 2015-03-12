'use strict';

var React = require('react/addons');
var Router = require('react-router');
var update = React.addons.update;

var CompRegLoader = require('../mixins/Loader');
var CMDComponent = require('./CMDComponent');
var CMDElement = require('./CMDElement');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  mixins: [Router.State, CompRegLoader],
  getInitialState: function() {
    return { profile: null, component: null, childElements: null, childComponents: null, editMode: false };
  },
  getRootComponent: function(props, state) {
    if(props == undefined) props = this.props;
    if(state == undefined) state = this.state;
    return (props.item != undefined && props.item != null) ? props.item : (state.profile || state.component);
  },
  componentWillMount: function() {
    this.props.profileId = this.getParams().profile;
    this.props.componentId = this.getParams().component;

    if(this.props.item != null)
      this.parseComponent(this.props.item, this.state);
  },
  componentWillReceiveProps: function(nextProps) {
    this.state.childElements = null;
    this.state.childComponents = null;
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('will update viewer');
    console.log('item props: ' + nextProps.item);

    var item = this.getRootComponent();
    var newItem = this.getRootComponent(nextProps, nextState);

    if(JSON.stringify(item) != JSON.stringify(newItem))
      this.parseComponent(newItem, nextState);
  },
  parseComponent: function(item, state) { //TODO: Handle expansion in further depths
    console.log('parseComponent');
    //console.log('state: ' + JSON.stringify(state));

    if(state.childComponents == null && state.childElements == null) {
      var root_Component = item.CMD_Component;
      var childComponents = (!$.isArray(root_Component.CMD_Component) && root_Component.CMD_Component != null) ? [root_Component.CMD_Component] : (root_Component.CMD_Component||[]);
      var childElements = (!$.isArray(root_Component.CMD_Element) && root_Component.CMD_Element != null) ? [root_Component.CMD_Element] : (root_Component.CMD_Element||[]);

      console.log('child item components: ' + childComponents.length);
      console.log('child item elements: ' + childElements.length);

      if(childElements.length == 1)
        console.log('first item element: ' + childElements[0]['@name']);

      for(var i=0; i < childComponents.length; i++)
        if(childComponents[i].hasOwnProperty("@ComponentId"))
          this.loadComponent(childComponents[i]["@ComponentId"], "json", function(data) {
              console.log('data child comp: ' + (data.CMD_Component != null));
              childComponents[i] = update(data, {open: {$set: false}});
          });
        else {
          childComponents[i] = update(childComponents[i], {open: {$set: false}})
          console.log('childComponent: ' + JSON.stringify(childComponents[i]));
        }

      this.setState({ childElements: childElements, childComponents: childComponents, profile: state.profile, component: state.component });
    }
  },
  printProperties: function(item) {
    var conceptLink = (item.CMD_Component != undefined && item.CMD_Component["@ConceptLink"] != null) ? <li><span>ConceptLink:</span> <a href={item.CMD_Component["@ConceptLink"]}>{item.CMD_Component["@ConceptLink"]}</a></li> : null;
    return (
      <ul>
        <li><span>Name:</span> <b>{item.Header.Name}</b></li>
        <li><span>Description:</span> {item.Header.Description}</li>
        {conceptLink}
      </ul>
    );
  },
  render: function () {
    var self = this;
    var item = this.getRootComponent();
    //console.log('item: ' + item);
    //console.log('state: ' + JSON.stringify(this.state.profile));

    if(item == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else {
      // Component hierarcy: expanded or non-expanded (@ComponentId)
      var childElem_jsx = null, childComp_jsx = null;
      if(this.state.childElements != null)
        childElem_jsx = (
          <div className="childElements">{this.state.childElements.map(
            function(elem, index) {
              return <CMDElement key={index} elem={elem} viewer={self} />;
            }
          )}
          </div>
        );

      if(this.state.childComponents != null)
        childComp_jsx = (
          <div className="childComponents">{this.state.childComponents.map(
            function(comp, index) {
              return <CMDComponent key={index} component={comp} viewer={self} />
            }
          )}
          </div>
        );

      return (
      <div className="ComponentViewer">
        <a name="info"/>
        <div className="rootProperties">{this.printProperties(item)}</div>
        {childElem_jsx}
        {childComp_jsx}
      </div>
      );
    }
  }
});

module.exports = ComponentViewer;
