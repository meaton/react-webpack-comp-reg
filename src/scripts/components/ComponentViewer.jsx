'use strict';

var React = require('react/addons');
var LinkedStateMixin = require('../mixins/LinkedStateMixin.js');
var ImmutableRenderMixin = require('react-immutable-render-mixin');

var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Alert = require('react-bootstrap/lib/Alert');

var Router = require('react-router'); // TODO migration to Router context
var update = React.addons.update;

var CompRegLoader = require('../mixins/Loader');
var btnGroup = require('../mixins/BtnGroupEvents');

var CMDComponent = require('./CMDComponent');
var CMDElement = require('./CMDElement');
var CMDAttribute = require('./CMDAttribute');

var EditorBtnGroup = require('./BtnMenuGroup');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  // TODO: static fns willTransitionTo/From
  mixins: [LinkedStateMixin, Router.State, Router.Navigation, btnGroup, CompRegLoader, ImmutableRenderMixin],
  getInitialState: function() {
    return { registry: { domainName: '', groupName: '' },
             profile: null,
             component: null,
             childElements: null,
             childComponents: null,
             editMode: (this.props.editMode != undefined) ?
                this.props.editMode :
                true,
             errors: null
    };
  },
  getDefaultProps: function() {
    return { domains: require('../domains.js') };
  },
  setItemPropToState: function(item) {
    if(item != null) {
      if(item['@isProfile'] == "true")
        this.setState({profile: item, childElements: null, childComponents: null});
      else
        this.setState({component: item, childElements: null, childComponents: null});
    }
  },
  updateInlineComponent: function(index, newComponent) {
    var childComponents = this.state.childComponents;

    if(newComponent != null)
      childComponents[index] = newComponent;

    this.setState({childComponents: childComponents});
  },
  updateComponentSettings: function(index, newMin, newMax) {
    console.log('comp update: ' + index, ' new min: ' + newMin, ' new max: ' + newMax);
    var childComponents = this.state.childComponents;
    console.log('child to update: ' + JSON.stringify(childComponents[index]));

    if(newMin != null)
      this.setChildComponentProperty(childComponents[index], '@CardinalityMin', newMin);
    if(newMax != null)
      this.setChildComponentProperty(childComponents[index], '@CardinalityMax', newMax);

    this.setState({childComponents: childComponents});
  },
  setChildComponentProperty : function(childComp, prop, newValue) {
    if(childComp == null)
      return;

    if(childComp.hasOwnProperty('prop'))
      childComp[prop] = newValue;
    if(childComp.Header != undefined && childComp.CMD_Component != undefined)
      if(!$.isArray(childComp.CMD_Component) && childComp.CMD_Component.hasOwnProperty(prop))
        childComp.CMD_Component[prop] = newValue;
  },
  updateAttribute: function(index, newAttr) {
    console.log('attr update: ' + index);
    var item = this.state.component || this.state.profile;
    var attrSet = item.CMD_Component.AttributeList.Attribute;
    attrSet[index] = newAttr;

    if(this.state.profile != null)
      this.setState({ profile: update(item, { CMD_Component: { AttributeList: { $set: { Attribute: attrSet } }}  }) });
    else if(this.state.component != null)
      this.setState({ component: update(item, { CMD_Component: { AttributeList: { $set: { Attribute: attrSet } }}  }) });

  },
  updateElement: function(index, newElement) {
    console.log('elem update: ' + index);
    var childElements = this.state.childElements;
    if(JSON.stringify(newElement) != JSON.stringify(childElements[index]))
      childElements[index] = newElement;

    this.setState({childElements: childElements});
  },
  showErrors: function(errors) {
    this.setState({errors: errors});
  },
  openCloseAll: function(bool, e) {
    var childElements = this.state.childElements.map(function(elem) {
        return update(elem, { open: { $set: bool }});
    });

    var childComponents = this.state.childComponents.map(function(comp) {
      return update(comp, { open: { $set: bool }});
    });

    this.setState({ childComponents: childComponents, childElements: childElements });
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
    console.log('new item props: ' + JSON.stringify(newItem));

    if(newItem != null && nextState.childComponents == null && nextState.childElements == null) {
      if(newItem.CMD_Component.AttributeList != undefined && !$.isArray(newItem.CMD_Component.AttributeList.Attribute))
        newItem.CMD_Component.AttributeList.Attribute = [newItem.CMD_Component.AttributeList.Attribute];

      this.parseComponent(newItem, nextState);
    }
  },
  componentDidUpdate: function(prevProps, prevState) {
    var item = this.state.component || this.state.profile;
    var prevItem = prevState.component || prevState.profile;

    console.log('component did update: ' + JSON.stringify(prevItem));

    if(item != null && prevItem != null && item.Header != undefined) {
      if((item.Header.Name != item.CMD_Component['@name']) ||
        (item.hasOwnProperty('@isProfile') && (item['@isProfile'] != prevItem['@isProfile'])) ) //TODO handle isProfile change for non-new resource
        if(item['@isProfile'] == "true")
          this.setState({ profile: update(item, { Header: { $merge: { Name: item.CMD_Component['@name']  }}}), component: null });
        else
          this.setState({ component: update(item, { Header: { $merge: { Name: item.CMD_Component['@name']  }}}), profile: null });
    }
  },
  componentDidMount: function() {
    var self = this;
    var id = this.props.profileId||this.props.componentId;

    console.log('viewer mounted: ' + id);
    console.log('editmode: ' + this.state.editMode);

    if(this.props.item != undefined || this.props.item != null)
      this.setItemPropToState(this.props.item);

    if(this.state.editMode)
      if(id != undefined && id != null)
        this.loadRegistryItem(id, function(regItem) {
          console.log("regItem:" + JSON.stringify(regItem));
          self.setState({registry: regItem});
        });
      else if(this.isActive('newEditor')) {
        console.log('Setting up new component...');
        this.setItemPropToState({ '@isProfile': "true", Header: { Name: "", Description: "" }, CMD_Component: { "@name": "", "@CardinalityMin": "1", "@CardinalityMax": "1" } });
      }
  },
  /*shouldComponentUpdate: function(nextProps, nextState) {
    console.log('update: ' + JSON.stringify(nextState.registry));

    return (!nextState.editMode || nextState.registry != null);
  },*/
  addNewComponent: function(evt) {
    var components = update(this.state.childComponents, { $push: [ { "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", open: true } ] });
    this.setState({ childComponents: components });
  },
  addNewElement: function(evt) {
    var elements = update(this.state.childElements, { $push: [ { "@name": "", "@ConceptLink": "", "@ValueScheme": "string", "@CardinalityMin": "1", "@CardinalityMax": "1", "@Multilingual": "false", open: true } ] });
    this.setState({ childElements: elements });
  },
  addNewAttribute: function(component, evt) {
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format
    var attrList = (component.AttributeList != undefined && $.isArray(component.AttributeList.Attribute)) ? component.AttributeList.Attribute : component.AttributeList;

    if(attrList != undefined && !$.isArray(attrList))
      attrList = [attrList];

    console.log('attrList: ' + attrList);
    var item = (attrList == undefined) ? update(component, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) : update(component, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    console.log('new item after attr add: ' + JSON.stringify(item));
    if(this.state.profile != null)
      this.setState({ profile: update(this.state.profile, { CMD_Component: { $set: item } }) });
    else if(this.state.component != null)
      this.setState({ component: update(this.state.component, { CMD_Component: { $set: item } }) });
    //else
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
        this.loadComponent(childComponents[i]["@ComponentId"], "json", function(data) {
            console.log('data child comp: ' + (data.CMD_Component != null));
            data.CMD_Component = update(data.CMD_Component, { $merge: {'@CardinalityMin': (childComponents[i].hasOwnProperty("@CardinalityMin")) ? childComponents[i]["@CardinalityMin"] : 1, '@CardinalityMax': (childComponents[i].hasOwnProperty("@CardinalityMax")) ? childComponents[i]["@CardinalityMax"] : 1}})
            childComponents[i] = update(data, {open: {$set: state.editMode}});
        });
      else {
        var isInlineComponent = (childComponents[i].Header == undefined);
        childComponents[i] = update(childComponents[i], {open: {$set: (state.editMode || isInlineComponent)}})
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
          return (this.state.editMode) ? (
            <Input type="select" label="Type" buttonAfter={<Button>Edit...</Button>} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
              {$.map(enumItems, function(item, index) {
                return <option key={index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</option>
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
          valueScheme = obj.Type;
    }

    return (!this.state.editMode) ? valueScheme : <Input type="text" label="Type" value={valueScheme} buttonAfter={<Button>Edit...</Button>} labelClassName="col-xs-1" wrapperClassName="col-xs-2"/>;
  },
  handleInputChange: function(link, e) {
    if(link != undefined && link != null)
      link.requestChange(e.target.value);
    else
      console.log('Linked state variable is undefined: ' + e.target);
  },
  handleRegistryInputChange: function(link, e) {
    if(link != undefined && link != null)
      if(this.state.registry != null)
        link.requestChange(e.target.value);
      else
        console.error('Registry data is empty: ' + this.state.registry);
    else
      console.log('Linked state variable is undefined: ' + e.target);
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

      var componentNameLink = this.linkState(this.getLinkStateCompTypeStr() + '.CMD_Component.@name');
      var handleNameChange = function(e) {
        console.log('name change: ' + e.target.value);
        componentNameLink.requestChange(e.target.value);
      };

      var headerDescLink = this.linkState(this.getLinkStateCompTypeStr() + '.Header.Description');
      var domainLink = this.linkState('registry.domainName');
      var groupNameLink = this.linkState('registry.groupName');

      // Registry Input fields
      var groupNameInput = (this.state.registry != null) ?
        <Input type="text" ref="rootComponentGroupName" label="Group Name" defaultValue={groupNameLink.value} onChange={this.handleRegistryInputChange.bind(this, groupNameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
                                         : null;
      var domainNameInput = (this.state.registry != null) ? (
        <Input type="select" ref="rootComponentDomain" label="Domain" defaultValue={domainLink.value} onChange={this.handleRegistryInputChange.bind(this, domainLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
          <option value="">Select a domain...</option>
          {this.props.domains.map(function(domain, index) {
            return <option key={index} value={domain.data}>{domain.label}</option>
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
          <Input type="text" ref="rootComponentName" label="Name" defaultValue={componentNameLink.value} onChange={handleNameChange} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {groupNameInput}
          <Input type="textarea" ref="rootComponentDesc" label="Description" defaultValue={headerDescLink.value} onChange={this.handleInputChange.bind(this, headerDescLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {domainNameInput}
          <Input type="text" label="ConceptLink" value={rootComponent["@ConceptLink"]} buttonAfter={this.conceptRegistryBtn()} labelClassName="col-xs-1" wrapperClassName="col-xs-3" />
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
    childComp = null,
    errors = null;

    var editBtnGroup = (this.state.editMode) ? <EditorBtnGroup ref="editorBtnGroup" mode="editor" { ...this.getBtnGroupProps() } /> : null;
    var controlLinks = (this.state.editMode) ? ( <div className="controlLinks">
      <a onClick={this.openCloseAll.bind(this, false)}>Collapse all</a> <a onClick={this.openCloseAll.bind(this, true)}>Expand all</a>
    </div> ) : null;

    var attrSet = (rootComponent && rootComponent.AttributeList != undefined && $.isArray(rootComponent.AttributeList.Attribute)) ? rootComponent.AttributeList.Attribute : rootComponent.AttributeList;
    var addAttrLink = (editMode) ? <div class="addAttribute controlLinks"><a onClick={this.addNewAttribute.bind(this, rootComponent)}>+Attribute</a></div> : null;

    if(attrSet != undefined || this.state.editMode)
      attrList = (
        <div className="attrList">AttributeList:
          {
            (attrSet)
            ? $.map(attrSet, function(attr, index) {
              return (
                <CMDAttribute key={'attr_' + index} attr={attr} getValue={self.getValueScheme} conceptRegistryBtn={self.conceptRegistryBtn()} editMode={editMode} onUpdate={self.updateAttribute.bind(self, index)} />
              );
            })
            : <span>No Attributes</span>
          }
          {addAttrLink}
        </div>
      );

    var cmdAddElementSpecLink = (this.state.editMode) ? <div className="addElement controlLinks"><a onClick={this.addNewElement}>+Element</a></div> : null;
    if(this.state.childElements != null)
      childElem = (
        <div ref="elements" className="childElements">{this.state.childElements.map(
          function(elem, index) {
            return <CMDElement key={'elem_' + index} elem={elem} viewer={self} editMode={editMode} onUpdate={self.updateElement.bind(self, index)}/>;
          }
        )}
          {cmdAddElementSpecLink}
        </div>
      );

    var cmdAddComponentSpecLink = (this.state.editMode) ? <div className="addComponent controlLinks"><a onClick={self.addNewComponent}>+Component</a></div> : null;
    if(this.state.childComponents != null)
      childComp = (
        // component key should be comp Id (except for inline comps)
        <div ref="components" className="childComponents">{this.state.childComponents.map(
          function(comp, index) {
            var compId;
            if(comp.hasOwnProperty("@ComponentId")) compId = comp['@ComponentId'];
            else if(comp.Header != undefined) compId = comp.Header.ID;
            else compId = "inline_" + index;

            return <CMDComponent key={comp['@ComponentId']} component={comp} viewer={self} getValue={self.getValueScheme} editMode={editMode} onInlineUpdate={self.updateInlineComponent.bind(self, index)} onUpdate={self.updateComponentSettings.bind(self, index)} />
          }
        )}
          {cmdAddComponentSpecLink}
        </div>
      );

    if(this.state.errors != null) {
        console.log('Render errors: ' + JSON.stringify(this.state.errors));
        errors = ( <Alert bsStyle="danger"><h4>Errors found:</h4>
                      { $.map(this.state.errors, function(error) { return <li>{error}</li> }) }
                   </Alert> );
    }

    return (
      <div className="ComponentViewer">
        {editBtnGroup}
        {errors}
        <div className="rootProperties">
          {this.printProperties(item)}
        </div>
        {attrList}
        {controlLinks}
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
