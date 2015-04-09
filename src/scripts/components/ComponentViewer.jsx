'use strict';

var React = require('react/addons');
var LinkedStateMixin = require('../mixins/LinkedStateMixin.js');

var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var Router = require('react-router');
var update = React.addons.update;

var CompRegLoader = require('../mixins/Loader');
var btnGroup = require('../mixins/BtnGroupEvents');

var CMDComponent = require('./CMDComponent');
var CMDElement = require('./CMDElement');
var CMDAttribute = require('./CMDAttribute');

var EditorBtnGroup = require('./BtnMenuGroup');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  mixins: [LinkedStateMixin, Router.State, btnGroup, CompRegLoader],
  getInitialState: function() {
    return { registry: null,
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
  setItemPropToState: function(item) {
    if(item != null) {
      if(item['@isProfile'])
        this.setState({profile: item, childElements: null, childComponents: null});
      else
        this.setState({component: item, childElements: null, childComponents: null});
    }
  },
  updateComponentSettings: function(index, newMin, newMax) {
    console.log('comp update: ' + index);
    var childComponents = this.state.childComponents;
    childComponents[index]['@CardinalityMin'] = newMin;
    childComponents[index]['@CardinalityMax'] = newMax;

    this.setState({childComponents: childComponents});
  },
  componentWillMount: function() {
    this.props.profileId = this.getParams().profile;
    this.props.componentId = this.getParams().component;
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('will receive props');

    if(this.props.editMode != nextProps.editMode)
      this.setState({editMode: nextProps.editMode});

    if(JSON.stringify(this.props.item) != JSON.stringify(nextProps.item))
      this.setItemPropToState(nextProps.item);
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('will update viewer');

    var newItem = nextState.profile||nextState.component;
    console.log('new item props: ' + newItem);

    if(newItem != null && nextState.childComponents == null && nextState.childElements == null) {
      if(newItem.CMD_Component.AttributeList != undefined && !$.isArray(newItem.CMD_Component.AttributeList.Attribute))
        newItem.CMD_Component.AttributeList.Attribute = [newItem.CMD_Component.AttributeList.Attribute];

      this.parseComponent(newItem, nextState);
    }
  },
  componentDidMount: function() {
    var self = this;
    var id = this.props.profileId||this.props.componentId;

    console.log('viewer mounted: ' + id);
    console.log('editmode: ' + this.state.editMode);

    this.setItemPropToState(this.props.item);

    if(this.state.editMode && this.state.registry == null)
      this.loadRegistryItem(id, function(regItem) {
        console.log("regItem:" + JSON.stringify(regItem));
        self.setState({registry: regItem});
      });
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    console.log('update: ' + JSON.stringify(nextState.registry));

    return (!nextState.editMode || nextState.registry != null);
  },
  parseComponent: function(item, state) {
    console.log('parseComponent');
    //console.log('state: ' + JSON.stringify(state));

    var rootComponent = item.CMD_Component;
    var childComponents = (!$.isArray(rootComponent.CMD_Component) && rootComponent.CMD_Component != null) ? [rootComponent.CMD_Component] : (rootComponent.CMD_Component||[]);
    var childElements = (!$.isArray(rootComponent.CMD_Element) && rootComponent.CMD_Element != null) ? [rootComponent.CMD_Element] : (rootComponent.CMD_Element||[]);

    console.log('child item components: ' + childComponents.length);
    console.log('child item elements: ' + childElements.length);

    if(childElements.length >= 1)
      console.log('first item element: ' + childElements[0]['@name']);

    for(var i=0; i < childComponents.length; i++)
      if(childComponents[i].hasOwnProperty("@ComponentId") && state.profile != null)
        this.loadComponent(childComponents[i]["@ComponentId"], "json", function(data) {
            console.log('data child comp: ' + (data.CMD_Component != null));
            data.CMD_Component = update(data.CMD_Component, { $merge: {'@CardinalityMin': (childComponents[i].hasOwnProperty("@CardinalityMin")) ? childComponents[i]["@CardinalityMin"] : 1, '@CardinalityMax': (childComponents[i].hasOwnProperty("@CardinalityMax")) ? childComponents[i]["@CardinalityMax"] : 1}})
            childComponents[i] = update(data, {open: {$set: false}});
        });
      else {
        childComponents[i] = update(childComponents[i], {open: {$set: false}})
        console.log('childComponent: ' + JSON.stringify(childComponents[i]));
      }

    this.replaceState({ childElements: childElements, childComponents: childComponents, profile: state.profile, component: state.component, registry: state.registry, editMode: state.editMode });
  },
  conceptRegistryBtn: function() {
    return (
      <Button>Search in concept registry...</Button>
    )
  },
  getValueScheme: function(obj) {
    var valueScheme = obj['@ValueScheme'];
    console.log(typeof valueScheme);

    if(typeof valueScheme != "string") {
      valueScheme = obj.ValueScheme;

      if(valueScheme != undefined) {
        if(valueScheme.pattern != undefined) // attr or elem
          valueScheme = valueScheme.pattern;
        else { // elem
          var enumItems = (!$.isArray(valueScheme.enumeration.item)) ? [valueScheme.enumeration.item] : valueScheme.enumeration.item;
          valueScheme = (this.state.editMode) ? (
            <Input type="select" label="Type" buttonAfter={<Button>Edit...</Button>} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
              {$.map(enumItems, function(item) {
                return <option>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</option>
              })}
            </Input>
          ) : (
            <DropdownButton bsSize="small" title={(enumItems.length > 0 && typeof enumItems[0] != "string") ? enumItems[0]['$'] : enumItems[0]}>
              {
                $.map(enumItems, function(item, index) {
                  return <MenuItem eventKey={index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</MenuItem>
                })
              }
            </DropdownButton>
          );
        }

      } else if(obj.Type != undefined) // attr
          return obj.Type;
    }

    return valueScheme;
  },
  getLinkStateCompTypeStr: function() {
    if(this.state.profile != null)
      return "profile";
    else if(this.state.component != null)
      return "component";
  },
  printProperties: function(item) {
    var self = this;
    var rootComponent = item.CMD_Component;

    if(this.state.editMode) {
      var isProfile = (item.hasOwnProperty("@isProfile")) ? (item['@isProfile']=="true") : false;

      console.log('has isProfile prop: ' + item.hasOwnProperty("@isProfile"));
      console.log('isProfile: ' + isProfile);

      // Linked state to data model
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
      };

      var headerDescLink = this.linkState(this.getLinkStateCompTypeStr() + '.Header.Description');
      var handleChange = function(link, e) {
        link.requestChange(e.target.value);
      };

      var domainLink = this.linkState('registry.domainName');
      var groupNameLink = this.linkState('registry.groupName');
      var handleRegistryChange = function(link, e) {
        if(self.state.registry != null)
          link.requestChange(e.target.value);
        else
          console.error('Registry data empty: ' + self.state.registry);
      };

      // Registry Input fields
      var groupNameInput = (this.state.registry != null) ?
        <Input type="text" ref="rootComponentGroupName" label="Group Name" defaultValue={groupNameLink.value} onChange={handleRegistryChange.bind(this, groupNameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
                                         : null;
      var domainNameInput = (this.state.registry != null) ? (
        <Input type="select" ref="rootComponentDomain" label="Domain" defaultValue={domainLink.value} onChange={handleRegistryChange.bind(this, domainLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
          <option value="">Select a domain...</option>
          {this.props.domains.map(function(domain) {
            return <option value={domain.data}>{domain.label}</option>
          })}
        </Input> )
        : null;

      // Edit properties form
      return (
        <form ref="editComponentForm" name="editComponent" className="form-horizontal form-group">
          <div className="form-group">
            <Input type="radio" name="isProfile" label="Profile" value={true} defaultChecked={isProfile} onChange={handleIsProfileChange} wrapperClassName="col-xs-offset-1 col-xs-1" />
            <Input type="radio" name="isProfile" label="Component" value={false} defaultChecked={!isProfile} onChange={handleIsProfileChange} wrapperClassName="col-xs-offset-1 col-xs-1" />
          </div>
          <Input type="text" ref="rootComponentName" label="Name" defaultValue={headerNameLink.value} onChange={handleNameChange} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {groupNameInput}
          <Input type="textarea" ref="rootComponentDesc" label="Description" defaultValue={headerDescLink.value} onChange={handleChange.bind(this, headerDescLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {domainNameInput}
          <Input type="text" label="ConceptLink" value={rootComponent["@ConceptLink"]} buttonAfter={this.conceptRegistryBtn.call()} labelClassName="col-xs-1" wrapperClassName="col-xs-3" />
        </form>
      );

    } else {
      // Display properties
      var conceptLink = (rootComponent && rootComponent["@ConceptLink"] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent["@ConceptLink"]}>{rootComponent["@ConceptLink"]}</a></li> : null;
      return (
        <ul>
          <li><span>Name:</span> <b>{item.Header.Name}</b></li>
          <li><span>Description:</span> {item.Header.Description}</li>
          {conceptLink}
        </ul>
      );
    }
  },
  printRootComponent: function(item) {
    // Component hierarcy: expanded or non-expanded (@ComponentId)
    var self = this,
    rootComponent = item.CMD_Component,
    editMode = this.state.editMode,
    attrList = null,
    childElem = null,
    childComp = null;

    var editBtnGroup = (this.state.editMode) ? <EditorBtnGroup mode="editor" { ...this.getBtnGroupProps() } /> : null;

    var attrSet = (rootComponent && rootComponent.AttributeList != undefined && $.isArray(rootComponent.AttributeList.Attribute)) ? rootComponent.AttributeList.Attribute : rootComponent.AttributeList;
    var addAttrLink = (editMode) ? <a onClick={this.addAttr}>+attribute</a> : null;

    if(attrSet != undefined)
      attrList = (
        <div className="attrList">AttributeList:
          {
            (attrSet)
            ? $.map(attrSet, function(attr, index) {
              return (
                <CMDAttribute key={'attr_' + index} attr={attr} getValue={self.getValueScheme} conceptRegistryBtn={self.conceptRegistryBtn.call()} editMode={editMode} />
              );
            })
            : <span>No Attributes</span>
          }
          {addAttrLink}
        </div>
      );

    if(this.state.childElements != null)
      childElem = (
        <div ref="elements" className="childElements">{this.state.childElements.map(
          function(elem, index) {
            return <CMDElement key={'elem_' + index} elem={elem} viewer={self} editMode={editMode} />;
          }
        )}
        </div>
      );

    if(this.state.childComponents != null)
      childComp = (
        // TODO component key should be comp Id
        <div ref="components" className="childComponents">{this.state.childComponents.map(
          function(comp, index) {
            return <CMDComponent key={comp['@ComponentId']} component={comp} viewer={self} getValue={self.getValueScheme} editMode={editMode} onUpdate={self.updateComponentSettings.bind(self, index)} />
          }
        )}
        </div>
      );

    return (
      <div className="ComponentViewer">
        {editBtnGroup}
        <div className="rootProperties">
          {this.printProperties(item)}
        </div>
        {attrList}
        <div className="controlLinks">
          <a onClick={this.closeAll}>Collapse all</a> <a onClick={this.openAll}>Expand all</a>
        </div>
        {childElem}
        {childComp}
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
