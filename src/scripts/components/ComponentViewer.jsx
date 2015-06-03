'use strict';

var React = require('react/addons');
var Router = require('react-router');
var ImmutableRenderMixin = require('react-immutable-render-mixin');

var DataTablesGrid = require('./DataTablesGrid');
var SpaceSelector = require('./SpaceSelector');

var LinkedStateMixin = require('../mixins/LinkedStateMixin');
var ActionButtonsMixin = require('../mixins/ActionButtonsMixin');
var CompRegLoader = require('../mixins/Loader');
var btnGroup = require('../mixins/BtnGroupEvents');
var ValidationMixin = require('../mixins/ValidationMixin');

var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Alert = require('react-bootstrap/lib/Alert');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');

var CMDComponent = require('./CMDComponent');
var CMDElement = require('./CMDElement');
var CMDAttribute = require('./CMDAttribute');

var EditorBtnGroup = require('./BtnMenuGroup');
var EditorDialog = require('./EditorDialog');

var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../styles/ComponentViewer.sass');

var ComponentViewer = React.createClass({
  statics: {
    willTransitionTo: function(transition, params, query) {
      console.log('attempting transition...' + transition.path);
    },
    willTransitionFrom: function(transition, component) {
      console.log('transition from...' + this.path);
      if(component.state.editMode && !component.state.isSaved)
        if(!confirm('You have unsaved work. Are you sure you want to cancel?'))
          transition.abort();
    }
  },
  contextTypes: {
    router: React.PropTypes.func,
    loggedIn: React.PropTypes.bool.isRequired
  },
  mixins: [ImmutableRenderMixin, LinkedStateMixin, btnGroup, CompRegLoader, ActionButtonsMixin, ValidationMixin, Router.Navigation, Router.State],
  getInitialState: function() {
    return { registry: { domainName: null, groupName: null },
             profile: null,
             component: null,
             childElements: null,
             childComponents: null,
             editMode: (this.props.editMode != undefined) ?
                this.props.editMode :
                true,
             errors: null,
             isSaved: false,
             editorComponents: "published"
    };
  },
  getDefaultProps: function() {
    return {
      domains: require('../domains.js')
    };
  },
  setItemPropToState: function(item) {
    if(item != null) {
      if(item['@isProfile'] == "true")
        this.setState({profile: item, childElements: null, childComponents: null});
      else
        this.setState({component: item, childElements: null, childComponents: null});
    }
  },
  selectedComponent: function(componentId, addComponent) {
    console.log('component selected in datatable: ' + componentId, addComponent);
    var selectedInlineComps = $('.CMDComponent.selected');
    if(addComponent) //TODO add to selected components if they exist
      if(selectedInlineComps.length > 0) {
        console.log('add component ' + componentId + ' to selected inline Components (' + selectedInlineComps.length + ')');
        this.addExistingComponent(componentId, selectedInlineComps);
      } else {
        console.log('add component ' + componentId + ' to root Component');
        this.addExistingComponent(componentId);
      }
  },
  addNewAttribute: function(component, evt) {
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format

    var attrList = (component.AttributeList != undefined && $.isArray(component.AttributeList.Attribute)) ? component.AttributeList.Attribute : component.AttributeList;
    if(attrList != undefined && !$.isArray(attrList)) attrList = [attrList];

    console.log('attrList: ' + attrList);
    var item = (attrList == undefined) ?
      update(component, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
      update(component, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    console.log('new item after attr add: ' + JSON.stringify(item));
    if(this.state.profile != null)
      this.setState({ profile: update(this.state.profile, { CMD_Component: { $set: item } }) });
    else if(this.state.component != null)
      this.setState({ component: update(this.state.component, { CMD_Component: { $set: item } }) });
  },
  addNewElement: function(evt) {
    var elements = update(this.state.childElements, { $push: [ { "@name": "", "@ConceptLink": "", "@ValueScheme": "string", "@CardinalityMin": "1", "@CardinalityMax": "1", "@Multilingual": "false", open: true } ] });
    this.setState({ childElements: elements });
  },
  addExistingComponent: function(componentId, selectedComps) { //TODO prevent component being added if already exists at that level
    var self = this;
    this.loadComponent(componentId, "json", function(data) {
        console.log('insert data child comp: ' + (data.CMD_Component != null));
        data['@ComponentId'] = componentId;
        data['open'] = true;

        var hasComp = function(comps, componentId) {
          var foundSibling = false;
          if($.isArray(comps))
            comps.forEach(function(comp) {
              if(comp['@ComponentId'] === componentId)
                foundSibling = true;
            });

          return foundSibling;
        };

        if(selectedComps == undefined) {
          if(hasComp(self.state.childComponents, data['@ComponentId']))
            alert('Cannot add existing component as sibling.');
          else {
            var updatedComponents = (self.state.childComponents) ? update(self.state.childComponents, { $push: [data] }) : [data];
            self.setState({ childComponents: updatedComponents });
          }
        } else if(self.state.childComponents != null) {
          // add component data to selected inline-components
          var newComponents = [];
          var checkInlineSelection = function(parent, compData) {
            if(parent.CMD_Component != undefined && parent.CMD_Component.length > 0) {
              var newChildComps = [];
              for(var i=0; i < parent.CMD_Component.length; i++) {
                var parentCompChild = parent.CMD_Component[i];
                if(parentCompChild.selected)
                  if(hasComp(parentCompChild.CMD_Component, data['@ComponentId']))
                    alert('Cannot add existing component as a sibling.');
                  else if(parentCompChild.CMD_Component != undefined)
                    parentCompChild = update(parentCompChild, { $merge: { CMD_Component: update(parentCompChild.CMD_Component, { $push: [compData] }), open: true } });
                  else
                    parentCompChild = update(parentCompChild, { $merge: { CMD_Component: [compData], open: true } });

                newChildComps.push(checkInlineSelection(parentCompChild, data));
              }
              return update(parent, { CMD_Component: { $set: newChildComps } });
            }
            return parent;
          };

          for(var j=0; j < self.state.childComponents.length; j++) {
            var comp = self.state.childComponents[j];
            if(comp.selected)
              if(hasComp(comp.CMD_Component, data['@ComponentId']))
                alert('Cannot add existing component as a sibling.');
              else if(comp.CMD_Component != undefined)
                  comp = update(comp, { $merge: { CMD_Component: update(comp.CMD_Component, { $push: [data] }), open: true } });
              else comp = update(comp, { $merge: { CMD_Component: [data], open: true } });

            comp = update(comp, { $apply: function(c) {
                return checkInlineSelection(c, data);
            } });
            newComponents.push(comp);
          }
          self.setState({ childComponents: newComponents });
        }
    });
  },
  addNewComponent: function(evt) {
    var components = update(this.state.childComponents, { $push: [ { "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", open: true } ] });
    this.setState({ childComponents: components });
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
    if(index >= 0 && index < childElements.length)
      if((newElement.elemId == childElements[index].elemId) &&
         (JSON.stringify(newElement) != JSON.stringify(childElements[index]))) {
        childElements[index] = newElement;
        this.setState({childElements: childElements});
      }
  },
  updateInlineComponent: function(index, newComponent) {
    console.log('inline update: ' + index);
    var childComponents = this.state.childComponents;
    if(index >= 0 && index < childComponents.length)
      if((newComponent != null) &&
         (newComponent.inlineId == childComponents[index].inlineId)) {
        childComponents[index] = newComponent;
        this.setState({childComponents: childComponents});
      }
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
        newItem = update(newItem, { CMD_Component: { AttributeList: { Attribute: { $set: [newItem.CMD_Component.AttributeList.Attribute] } }}});

      this.parseComponent(newItem, nextState);
    }
  },
  componentDidUpdate: function(prevProps, prevState) {
    var self = this;

    var item = this.state.component || this.state.profile;
    var prevItem = prevState.component || prevState.profile;

    console.log('component did update: ' + JSON.stringify(item));

    if(item != null && prevItem != null && item.Header != undefined) {
      if(item.Header.Name != item.CMD_Component['@name'] ||
        (item.hasOwnProperty('@isProfile') && (item['@isProfile'] != prevItem['@isProfile'])))
        if(item['@isProfile'] == "true")
          this.setState({ profile: update(item, { Header: { $merge: { Name: item.CMD_Component['@name']  }}}), component: null });
        else
          this.setState({ component: update(item, { Header: { $merge: { Name: item.CMD_Component['@name']  }}}), profile: null });
    }

    if(this.state.editMode && this.refs.grid != undefined && this.refs.grid.isMounted()) {
      $('#' + this.refs.grid.getDOMNode().id).one( 'draw.dt', function () {
        var elem = React.createElement(SpaceSelector, { type:"componentsOnly", filter:self.state.editorComponents, onSelect: self.switchEditorComponents, validUserSession: self.context.loggedIn, multiSelect:false});
        React.render(elem, $('#testtable_wrapper div.toolbar').get(0));
      });
    }
  },
  componentDidMount: function() {
    var self = this;
    var id = this.getParams().component || this.getParams().profile;

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

    this.setState({ childElements: childElements, childComponents: childComponents, profile: (item['@isProfile'] === "true") ? item : state.profile, component: (item['@isProfile'] === "true") ? state.component : item, registry: state.registry, editMode: state.editMode });
  },
  switchEditorComponents: function(filter) {
    this.setState({ editorComponents: filter });
  },
  conceptRegistryBtn: function(container, target) {
    if(container == undefined) container = this;
    if(target == undefined) target = container;
    return (
      <EditorDialog type="ConceptRegistry" label="Search in concept registry..." container={container} target={target} />
    );
  },
  updateConceptLink: function(newValue) {
    console.log('update concept link - root component/profile: ' + newValue);
    if(typeof newValue === "string") // TODO Remove @ConceptLink attr is empty or null value
      if(this.state.component != null)
        this.setState({ component: (this.state.component.Header != undefined) ?
          update(this.state.component, { 'CMD_Component': { $merge: { '@ConceptLink': newValue } } }) :
          update(this.state.component, { $merge: { '@ConceptLink': newValue } })
        });
      else if(this.state.profile != null)
        this.setState({ profile: update(this.state.profile, { 'CMD_Component': { $merge: { '@ConceptLink': newValue } } }) });
  },
  updateValueScheme: function(target, prop, newValue) {
    console.log('update value scheme:' + target.constructor.displayName);

    var updateTypeFn = function(item) {
      var props = prop;

      if(props == undefined) props = "@ValueScheme";
      else if(props != "@ValueScheme" && props != "Type") props = "ValueScheme";

      if(props != '@ValueScheme' && item.hasOwnProperty('@ValueScheme'))
        delete item['@ValueScheme'];
      else if(props != "Type" && item.hasOwnProperty('Type'))
        delete item['Type'];
      else if(props != 'ValueScheme' && item.hasOwnProperty('ValueScheme'))
        delete item['ValueScheme'];

      if(props == '@ValueScheme' || props == 'Type')
        item[props] = newValue;
      else {
        item['ValueScheme'] = new Object();
        item['ValueScheme'][prop] = newValue;
      }

      return item;
    };

    if(target != undefined) {
      var updatedItem = null;
      if(target.constructor.displayName === "CMDAttribute")
        updatedItem = { attr: update(target.state.attr, { $apply: updateTypeFn }) };
      else if(target.constructor.displayName === "CMDElement")
        updatedItem = { elem: update(target.state.elem, { $apply: updateTypeFn }) };

      if(updatedItem != null)
        target.setState(updatedItem);
    }
  },
  getValueScheme: function(obj, container, target) {
    if(container == undefined) container = this;
    if(target == undefined) target = container;
    if(obj == undefined) return null;

    var typeTrigger = (
      <EditorDialog type="Type" label="Edit..." container={container} target={target} />
    );

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
            <Input ref="typeInput" type="select" label="Type" buttonAfter={typeTrigger} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={this.updateValueScheme.bind(this, target)}>
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

    return (!this.state.editMode) ? valueScheme : <Input ref="typeInput" type="text" label="Type" value={valueScheme} buttonAfter={typeTrigger} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={this.updateValueScheme.bind(this, target)} readOnly />;
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
      var groupNameInput = <Input type="text" ref="rootComponentGroupName" key={(this.state.registry.hasOwnProperty('id')) ? this.state.registry.id + "_groupName" : "root_groupName"} label="Group Name" defaultValue={groupNameLink.value} onChange={this.handleRegistryInputChange.bind(this, groupNameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />;
      var domainNameInput = (
        <Input type="select" ref="rootComponentDomain" key={(this.state.registry.hasOwnProperty('id')) ? this.state.registry.id + "_domainName" : "root_domainName"} label="Domain" defaultValue={domainLink.value} onChange={this.handleRegistryInputChange.bind(this, domainLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
          <option value="">Select a domain...</option>
          {this.props.domains.map(function(domain, index) {
            return <option key={index} value={domain.data}>{domain.label}</option>
          })}
        </Input> );

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
          <Input ref="conceptRegInput" type="text" label="ConceptLink" value={(rootComponent['@ConceptLink']) ? rootComponent['@ConceptLink'] : ""} buttonAfter={this.conceptRegistryBtn(this)} labelClassName="col-xs-1" wrapperClassName="col-xs-3" onChange={this.updateConceptLink} readOnly />
        </form>
      );

    } else {
      // Display properties
      var conceptLink = (rootComponent && rootComponent['@ConceptLink'] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent['@ConceptLink']}>{rootComponent['@ConceptLink']}</a></li> : null;
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

    var controlLinks = (this.state.editMode) ? ( <div className="controlLinks">
      <a onClick={this.openCloseAll.bind(this, false)}>Collapse all</a> <a onClick={this.openCloseAll.bind(this, true)}>Expand all</a>
    </div> ) : null;

    var attrSet = (rootComponent && rootComponent.AttributeList != undefined && $.isArray(rootComponent.AttributeList.Attribute)) ? rootComponent.AttributeList.Attribute : rootComponent.AttributeList;
    var addAttrLink = (editMode) ? <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute.bind(this, rootComponent)}>+Attribute</a></div> : null;

    if(attrSet != undefined || this.state.editMode)
      attrList = (
        <div className="attrList">AttributeList:
          {
            (attrSet != undefined && attrSet.length > 0)
            ? $.map(attrSet, function(attr, index) {
              var attrId = (attr.attrId != undefined) ? attr.attrId : "root_attr_" + md5.hash("root_attr_" + index + "_" + Math.floor(Math.random()*1000));
              attr.attrId = attrId;
              //TODO attach dialogs to itself as container rather than viewer
              return (
                <CMDAttribute key={attrId} attr={attr} value={self.getValueScheme.bind(self, attr, self)} conceptRegistryBtn={self.conceptRegistryBtn.bind(self, self)} editMode={editMode} onUpdate={self.updateAttribute.bind(self, index)} onRemove={self.removeAttribute.bind(self, index)} />
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
            var elemId = (elem.elemId != undefined) ? elem.elemId : "elem_" + md5.hash("elem_" + elem['@name'] + index);
            elem.elemId = elemId;
            return <CMDElement key={elemId} elem={elem} viewer={self} editMode={editMode} onUpdate={self.updateElement.bind(self, index)} onRemove={self.removeElement.bind(self, index)} moveUp={self.moveElement.bind(self, index, index-1)} moveDown={self.moveElement.bind(self, index, index+1)} />;
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
            else compId = "inline_" + md5.hash("inline_" + comp['@name'] + index);

            return <CMDComponent key={compId} component={comp} viewer={self} editMode={editMode} onInlineUpdate={self.updateInlineComponent.bind(self, index)} onUpdate={self.updateComponentSettings.bind(self, index)} onRemove={self.removeComponent.bind(self, index)} moveUp={self.moveComponent.bind(self, index, index-1)} moveDown={self.moveComponent.bind(self, index, index+1)} />
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

    //TODO contain properties in its own component
    var rootClasses = classNames({ ComponentViewer: true });
    return (
      <div className={rootClasses}>
        {errors}
        <div className="rootProperties">
          {this.printProperties(item)}
        </div>
        {attrList}
        {controlLinks}
        {childElem}
        {childComp}
        {controlLinks}
      </div>
    );
  },
  render: function() {
    var self = this;
    var item = this.state.profile||this.state.component;
    var editBtnGroup = (this.state.editMode) ? <EditorBtnGroup ref="editorBtnGroup" mode="editor" { ...this.getBtnGroupProps() } /> : null;

    if(item == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else {
      var rootComponent = this.printRootComponent(item);
      return (this.state.editMode) ? (
        <div className="editor container-fluid">
          <div className="component-edit-form row">
            {editBtnGroup}
            {rootComponent}
          </div>
          <div className="component-grid row">
            <DataTablesGrid ref="grid" type="components" filter={this.state.editorComponents} multiple={false} component={this.selectedComponent} profile={null} editMode={this.state.editMode} />
          </div>
        </div>
      ) : rootComponent;
    }
  }
});

module.exports = ComponentViewer;
