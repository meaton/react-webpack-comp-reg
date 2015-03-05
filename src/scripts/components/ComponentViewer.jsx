'use strict';

var React = require('react/addons');
var Router = require('react-router');
var update = React.addons.update;

var CompRegLoader = require('../mixins/Loader');

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
  parseComponent: function(item, state) {
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
  printElement: function(elem, index) {
    return (
      <div key={"elem"+index} className="CMDElement">
        <span>Element: </span>
        {elem['@name']}  {elem['@ValueScheme']}
      </div>
    )
  },
  printComponent: function(comp, index) {
    var self = this;
    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name'];
    var isOpen = comp.open;

    comp = (header != undefined) ? comp.CMD_Component : comp;

    console.log('comp header: ' + JSON.stringify(header));
    console.log('open: ' + isOpen);

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);
    var compElems = comp.CMD_Element;

    console.log('comp elems: ' + $.isArray(compElems));
    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];
    compElems = (compElems != undefined) ? compElems.map(function(elem, index) {
      console.log()
      return self.printElement(elem, index)
    }) : null;

    var compComps = comp.CMD_Component;
    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    compComps = (compComps != undefined) ?
      compComps = compComps.map(function(nestedComp, index) {
        var compId;
        if(nestedComp.hasOwnProperty("@ComponentId"))
          compId = nestedComp["@ComponentId"];
        else if(nestedComp.Header != undefined)
          compId = nestedComp.Header.ID;
        else
          compId = null;
        console.log('nested comp: ' + nestedComp.compId);

        return (nestedComp.compId != undefined) ? <div>{nestedComp.compId}</div> : <div><span className="nested">Component (level--): </span>{nestedComp['@name']}</div>//<ComponentViewer item={comp} display="false" />;
    }) : null;

    var cx = React.addons.classSet;
    var classes = cx({
      'hide': !isOpen,
      'componentBody': true
    });

    return (
       <div key={"comp"+index} className="CMDComponent">
        <span>Component: </span><a href="#info" onClick={this.toggleComponent.bind(this, index)}>{compName}</a>
        {compProps}
        <div className={classes}>
          <div className="childElements">{compElems}</div>
          <div className="childComponents">{compComps}</div>
        </div>
       </div>
     )
  },
  toggleComponent: function(compIdx) {
    var comp = (this.state.childComponents != null && compIdx <= this.state.childComponents.length && compIdx >= 0) ? this.state.childComponents[compIdx] : null;
    if(comp != null) {
      //console.log('component click: ' + comp.Header.ID);
      this.state.childComponents[compIdx] = update(this.state.childComponents[compIdx], { open: { $set: !comp.open }});
      this.setState({childComponents: this.state.childComponents});
    } else
      console.log('component not found: ' + compIdx);
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
              return self.printElement(elem, index);
            }
          )}
          </div>
        );

      if(this.state.childComponents != null)
        childComp_jsx = (
          <div className="childComponents">{this.state.childComponents.map(
            function(comp, index) {
              //console.log(JSON.stringify(comp));
              return self.printComponent(comp, index);
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
