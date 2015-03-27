'use strict';

var React = require('react/addons');
var LinkedStateMixin = require('../../../node_modules/react-catalyst/src/catalyst/LinkedStateMixin.js');

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
  mixins: [LinkedStateMixin, Router.State, btnGroup, CompRegLoader],
  getInitialState: function() {
    return { registry: null, // valueLink
             profile: null,
             component: null,
             childElements: null,
             childComponents: null,
             editMode: (this.props.editMode != undefined) ?
                this.props.editMode :
                true
    };
  },
  getDefaultProps: function() {
    return { domains: require('../domains.js') };
  },
  componentWillMount: function() {
    this.props.profileId = this.getParams().profile;
    this.props.componentId = this.getParams().component;
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('will receive props');
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('will update viewer');
    var item = this.state.profile||this.state.component;
    var newItem = nextState.profile||nextState.component;

    console.log('new item props: ' + newItem);

    if(JSON.stringify(item) != JSON.stringify(newItem)) {
      nextState.childElements = null;
      nextState.childComponents = null;

      this.parseComponent(newItem, nextState);
    }
  },
  componentDidMount: function() {
    var self = this;
    var id = this.props.profileId||this.props.componentId;

    console.log('viewer mounted: ' + id);
    console.log('editmode: ' + this.state.editMode);

    if(this.props.item != null)
      if(this.props.item['@isProfile'])
        this.setState({profile: this.props.item});
      else
        this.setState({component: this.props.item});

    if(this.state.editMode)
      this.loadRegistryItem(id, function(regItem) {
        console.log("regItem:" + JSON.stringify(regItem));
        self.setState({registry: regItem});
      });
  },
  parseComponent: function(item, state) {
    console.log('parseComponent');
    console.log('state: ' + JSON.stringify(state));

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
  getLinkStateCompTypeStr: function() {
    if(this.state.profile != null)
      return "profile";
    else if(this.state.component != null)
      return "component";
  },
  printProperties: function(item) {
    var self = this;
    var root_Component = item.CMD_Component;

    if(this.state.editMode) { //TODO: incl edit button menubar
      var registry = this.state.registry;
      var isProfile = (item.hasOwnProperty("@isProfile")) ? (item['@isProfile']=="true") : false;

      console.log('has isProfile prop: ' + item.hasOwnProperty("@isProfile"));
      console.log('isProfile: ' + isProfile);

      var isProfileLink = this.linkState(this.getLinkStateCompTypeStr() + '.@isProfile');
      var handleIsProfileChange = function(e) {
        console.log('linked state change: ' + e.target.value);
        isProfileLink.requestChange(e.target.value);
      };

      var headerNameLink = this.linkState(this.getLinkStateCompTypeStr() + '.Header.Name');
      var componentNameLink = this.linkState(this.getLinkStateCompTypeStr() + '.CMD_Component.@name');
      var handleNameChange = function(e) {
        console.log('name change: ' + e.target.value);

        headerNameLink.requestChange(e.target.value);
        componentNameLink.requestChange(e.target.value);
      }

      var groupNameInput = (registry != null) ? <Input type="text" ref="rootComponentGroupName" label="Group Name" valueLink={this.linkState('registry.groupName')} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
                                         : null;
      var domainNameInput = (registry != null) ? (
        <Input type="select" ref="rootComponentDomain" label="Domain" valueLink={this.linkState('registry.domainName')} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
          <option value="">Select a domain...</option>
          {this.props.domains.map(function(domain) {
            return <option value={domain.data}>{domain.label}</option>
          })}
        </Input> )
        : null;

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
          <Input type="radio" name="isProfile" label="Profile" value={true} defaultChecked={isProfileLink} onChange={handleIsProfileChange} wrapperClassName="col-xs-offset-1 col-xs-1" />
          <Input type="radio" name="isProfile" label="Component" value={false} defaultChecked={(!isProfile) ? "checked" : ""} onChange={handleIsProfileChange} wrapperClassName="col-xs-offset-1 col-xs-1" />
        </div>
        <Input type="text" ref="rootComponentName" label="Name" defaultValue={headerNameLink.value} onChange={handleNameChange} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {groupNameInput}
          <Input type="textarea" ref="rootComponentDesc" label="Description" valueLink={this.linkState(this.getLinkStateCompTypeStr() + '.Header.Description')} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {domainNameInput}
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
    var item = this.state.profile||this.state.component;

    if(item == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else
        return this.printRootComponent(item);
  }
});

module.exports = ComponentViewer;
