'use strict';

var React = require('react/addons');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

var Router = require('react-router');
var update = React.addons.update;

var CompRegLoader = require('../mixins/Loader');
var btnGroup = require('../mixins/BtnGroupEvents');

var CMDComponent = require('./CMDComponent');
var CMDElement = require('./CMDElement');
var EditorBtnGroup = require('./BtnMenuGroup');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  mixins: [Router.State, btnGroup, CompRegLoader],
  getInitialState: function() {
    return { registry: null, profile: null, component: null,
             childElements: null, childComponents: null,
             editMode: (this.props.editMode != undefined) ? this.props.editMode : true
    };
  },
  getDefaultProps: function() {
    return { domains: require('../domains.js') };
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
  componentDidMount: function() {
    var self = this;
    var id = this.props.profileId||this.props.componentId;

    console.log('viewer mounted: ' + id);
    console.log('editmode: ' + this.state.editMode);
    if(this.state.editMode)
      this.loadRegistryItem(id, function(regItem) {
        self.setState({registry: regItem})
      });
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
  conceptRegistryBtn: function() {
    return (
      <Button>Search in concept registry...</Button>
    )
  },
  changeComponentType: function(evt) {
    console.log("component type: " + evt.target);
    this.getRootComponent()['@isProfile'] = evt.target.defaultValue;
    this.forceUpdate();
  },
  printProperties: function(item) {
    var self = this;
    var root_Component = item.CMD_Component;
    if(this.state.editMode) { //TODO: incl edit button menubar
      var registry = this.state.registry;
      var isProfile = (item.hasOwnProperty("@isProfile")) ? (item['@isProfile']=="true") : false;
      var groupName= (registry != null) ? registry.groupName : "";
      var domainVal = (registry != null) ? registry.domainName : "";
      var attrSet = (root_Component && root_Component.AttributeList != undefined && $.isArray(root_Component.AttributeList.Attribute)) ? root_Component.AttributeList.Attribute : root_Component.AttributeList;
      var attrList = (
        <div className="attrList">AttributeList:
          <div className="attrAttr">
          {
            (attrSet)
            ? $.map(attrSet, function(attr, index) {
              return (
                <div key={index} className="attrForm">
                  <Input type="text" label="Name" defaultValue={attr.Name} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
                  <Input type="text" label="Type" value={attr.Type} labelClassName="col-xs-1" wrapperClassName="col-xs-2" buttonAfter={<Button>Edit...</Button>} />
                  <Input type="text" label="ConceptLink" value={(attr.ConceptLink != undefined) ? attr.ConceptLink : ""} labelClassName="col-xs-1" wrapperClassName="col-xs-3" buttonAfter={self.conceptRegistryBtn()} />
                </div>
              );
            })
            : <span>No Attributes</span>
          }
          </div>
          <a onClick={this.addAttr}>+attribute</a>
        </div>
      );
      return (
        <form ref="editComponentForm" name="editComponent">
        <div className="form-horizontal form-group">
        <div className="form-group">
          <Input type="radio" name="isProfile" label="Profile" value={true} checked={(isProfile) ? "checked" : ""} onClick={this.changeComponentType} wrapperClassName="col-xs-offset-1 col-xs-1" />
          <Input type="radio" name="isProfile" label="Component" value={false} checked={(!isProfile) ? "checked" : ""} onClick={this.changeComponentType} wrapperClassName="col-xs-offset-1 col-xs-1" />
        </div>
        <Input type="text" ref="rootComponentName" label="Name" defaultValue={item.Header.Name} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          <Input type="text" ref="rootComponentGroupName" label="Group Name" defaultValue={groupName} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          <Input type="textarea" ref="rootComponentDesc" label="Description" defaultValue={item.Header.Description} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          <Input type="select" ref="rootComponentDomain" label="Domain" defaultValue={domainVal} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
            <option value="">Select a domain...</option>
            {this.props.domains.map(function(domain) {
              return <option value={domain.data}>{domain.label}</option>
            })}
          </Input>
          <Input type="text" label="ConceptLink" value={root_Component["@ConceptLink"]} buttonAfter={this.conceptRegistryBtn.call()} labelClassName="col-xs-1" wrapperClassName="col-xs-3" />
          {attrList}
        </div>
        </form>
      );
    } else {
      var conceptLink = (root_Component && root_Component["@ConceptLink"] != null) ? <li><span>ConceptLink:</span> <a href={root_Component["@ConceptLink"]}>{root_Component["@ConceptLink"]}</a></li> : null;
      return (
        <ul>
          <li><span>Name:</span> <b>{item.Header.Name}</b></li>
          <li><span>Description:</span> {item.Header.Description}</li>
          {conceptLink}
        </ul>
      );
    }
  },
  printRootComponent: function(rootComponent) {
    // Component hierarcy: expanded or non-expanded (@ComponentId)

    var self = this, editMode = this.state.editMode, childElem_jsx = null, childComp_jsx = null;
    var editBtnGroup = (this.state.editMode) ? <EditorBtnGroup mode="editor" { ...this.getBtnGroupProps() } /> : null;
    if(this.state.childElements != null)
      childElem_jsx = (
        <div className="childElements">{this.state.childElements.map(
          function(elem, index) {
            return <CMDElement key={index} elem={elem} viewer={self} editMode={editMode} />;
          }
        )}
        </div>
      );

    if(this.state.childComponents != null)
      childComp_jsx = (
        <div className="childComponents">{this.state.childComponents.map(
          function(comp, index) {
            return <CMDComponent key={index} component={comp} viewer={self} editMode={editMode} />
          }
        )}
        </div>
      );

    return (
    <div className="ComponentViewer">
      {editBtnGroup}
      <div className="rootProperties">{this.printProperties(rootComponent)}</div>
      {childElem_jsx}
      {childComp_jsx}
    </div>
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
    else
        return this.printRootComponent(item);
  }
});

module.exports = ComponentViewer;
