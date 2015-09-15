'use strict';

var React = require('react/addons');
var Router = require('react-router');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');
//var CompRegLoader = require('../mixins/Loader');
var btnGroup = require('../../mixins/BtnGroupEvents');
var ValidationMixin = require('../../mixins/ValidationMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Alert = require('react-bootstrap/lib/Alert');
var Modal = require('react-bootstrap/lib/Modal');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');

//components
var DataTablesGrid = require('./DataGrid');
var SpaceSelector = require('./SpaceSelector');
var CMDComponent = require('./CMDComponent');
var CMDElement = require('./CMDElement');
var CMDAttribute = require('./CMDAttribute');
var EditorBtnGroup = require('./BtnMenuGroup');
//TODO flux: var EditorDialog = require('./EditorDialog');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/ComponentViewer.sass');

/**
* ComponentViewer - view display and editing form for a CMDI Profile or Component item and its root properties, nested Components (CMDComponent), Elements, (CMDElement) and Attributes (CMDAttribute).
* @constructor
* @mixes ImmutableRenderMixin
* @LinkedStateMixin
* @BtnGroupEvents
* @Loader
* @ActionButtonsMixin
* @ValidationMixin
* @Router.Navigation
* @Router.State
*/
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
  propTypes: {
    item: React.PropTypes.object.isRequired,
    spec: React.PropTypes.object.isRequired,
    editMode: React.PropTypes.bool.isRequired
    //,childElements: React.PropTypes.array,
    // childComponents: React.PropTypes.array,
  },
  contextTypes: {
    router: React.PropTypes.func,
    //TODO flux: auth context - loggedIn: React.PropTypes.bool.isRequired
  },
  mixins: [
    //ImmutableRenderMixin,
    LinkedStateMixin,
    btnGroup, ActionButtonsMixin, ValidationMixin, Router.Navigation, Router.State],
  // getInitialState: function() {
  //   return { registry: { domainName: '', groupName: '' },
  //            childElements: null,
  //            childComponents: null,
  //            errors: null,
  //            isSaved: false,
  //            isEdited: false,
  //            editorComponents: "published"
  //   };
  // },
  getDefaultProps: function() {
    return {
      domains: require('../../domains.js')
    };
  },

  selectedComponent: function(componentId, addComponent) {
    console.log('component selected in datatable: ' + componentId, addComponent);
    var selectedInlineComps = $('.CMDComponent.selected');
    if(addComponent)
      if(selectedInlineComps.length > 0) {
        console.log('add component ' + componentId + ' to selected inline Components (' + selectedInlineComps.length + ')');
        this.addExistingComponent(componentId, selectedInlineComps);
      } else {
        console.log('add component ' + componentId + ' to root Component');
        this.addExistingComponent(componentId);
      }
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
  componentWillUpdate: function(nextProps, nextState) {
    console.log(this.constructor.displayName, 'will update');
    var self = this;
    var newItem = nextProps.spec;  //console.log('new item props: ' + JSON.stringify(newItem));
    var prevItem = this.props.spec;

    if(nextState.editMode && prevItem != null && !nextState.isEdited && JSON.stringify(newItem) != JSON.stringify(prevItem))
      this.setState({ isEdited: true });

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
  switchEditorComponents: function(filter) {
    this.setState({ editorComponents: filter });
  },
  conceptRegistryBtn: function(container, target) {
    if(container == undefined) container = this;
    if(target == undefined) target = container;
    //TODO flux:
    // return (
    //   <EditorDialog type="ConceptRegistry" label="Search in concept registry..." container={container} target={target} />
    // );
    return null;
  },
  updateConceptLink: function(newValue) {
    console.log('update concept link - root component/profile: ' + newValue);

    if(typeof newValue === "string") // TODO Remove @ConceptLink attr is empty or null value
      if(this.props.spec['@isProfile'] !== "true")
        this.setState({ component: (this.props.spec.Header != undefined) ?
          update(this.props.spec, { 'CMD_Component': { $merge: { '@ConceptLink': newValue } } }) :
          update(this.props.spec, { $merge: { '@ConceptLink': newValue } })
        });
      else if(this.props.spec['@isProfile'] === "true")
        this.setState({ profile: update(this.props.spec, { 'CMD_Component': { $merge: { '@ConceptLink': newValue } } }) });
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

    // TODO flux
    // var typeTrigger = (
    //   <EditorDialog type="Type" label="Edit..." container={container} target={target} />
    // );

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
  handleUsageWarning: function(errors, cb) { // //TODO display components (non-profiles) that are linked?
    var self = this;
    var errors = this.processUsageErrors(errors);
    console.log('handleUsageWarning errors len(): ', errors.length);

    if(errors.length >= 1) {
      var saveContinue = function(evt) {
        self.closeAlert("alert-container", evt);
        cb(true);
      };

      var instance = (
        <Modal title={"Component is used"}
          enforceFocus={true}
          backdrop={true}
          animation={false}
          container={this}
          onRequestHide={this.closeAlert.bind(this, "alert-container")}>
          <div className="modal-body">
            <div className="modal-desc">
              <div>The component you are about to save is used by the following component(s) and/or profile(s):
                <ul>{errors}</ul>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div>Changes in this component will affect the above. Do you want to proceed?</div>
            <Button onClick={saveContinue} bsStyle="primary">Yes</Button>
            <Button onClick={this.closeAlert.bind(this, "alert-container")}>No</Button>
          </div>
        </Modal>
      );

      this.renderAlert(instance, "alert-container");
    } // else console.warn('Expect a single error result to display, value: ', errors);
  },
  getLinkStateCompTypeStr: function() {
    if(this.props.spec['@isProfile'] === "true")
      return "profile";
    else
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
        // component key should be componentId (except for inline comps which use generated hash)
        <div ref="components" className="childComponents">{this.state.childComponents.map(
          function(comp, index) {
            var compId;
            if(comp.hasOwnProperty("@ComponentId")) compId = comp['@ComponentId'];
            else if(comp.Header != undefined) compId = comp.Header.ID;
            else compId = (comp.inlineId != undefined) ? comp.inlineId : "inline_" + md5.hash("inline_" + comp['@name'] + index);

            var newComp = comp;
            if(compId.startsWith("inline") && comp.inlineId == undefined)
              newComp = update(newComp, { $merge: { inlineId: compId } });

            return <CMDComponent key={compId} component={newComp} viewer={self} editMode={editMode} onInlineUpdate={self.updateInlineComponent.bind(self, index)} onUpdate={self.updateComponentSettings.bind(self, index)} onRemove={self.removeComponent.bind(self, index)} moveUp={self.moveComponent.bind(self, index, index-1)} moveDown={self.moveComponent.bind(self, index, index+1)} />
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
    var item = this.props.spec;
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
            {/* TODO flux: update props, see application.jsx */}
            <DataTablesGrid ref="grid" type="components" filter={this.state.editorComponents} multiple={false} component={this.selectedComponent} profile={null} editMode={this.state.editMode}>
              <SpaceSelector type="componentsOnly" filter={this.state.editorComponents} onSelect={this.switchEditorComponents} validUserSession={this.context.loggedIn} multiSelect={false} />
            </DataTablesGrid>
          </div>
          <div id="alert-container"/>
        </div>
      ) : rootComponent;
    }
  },

  // componentWillReceiveProps: function(nextProps) {
  //   console.log(this.constructor.displayName, 'will receive props');
  //
  //   if(this.props.editMode != nextProps.editMode)
  //     this.setState({editMode: nextProps.editMode});
  //
  //   if(JSON.stringify(this.props.item) != JSON.stringify(nextProps.item))
  //     this.setItemPropToState(nextProps.item);
  // },
  // componentDidUpdate: function(prevProps, prevState) {
  //   var self = this;
  //
  //   var item = this.state.component || this.state.profile;
  //   var prevItem = prevState.component || prevState.profile;
  //
  //   console.log(this.constructor.displayName, 'component did update: ' + JSON.stringify(item));
  //
  //   if(item != null && prevItem != null && item.Header != undefined) {
  //     if(this.state.isSaved) this.refs.grid.setLoading(false);
  //     if(this.state.isEdited) this.refs.grid.setLoading(false);
  //     if(item.Header.Name != item.CMD_Component['@name'] ||
  //       (item.hasOwnProperty('@isProfile') && (item['@isProfile'] != prevItem['@isProfile'])))
  //       if(item['@isProfile'] == "true")
  //         this.setState({ profile: update(item, { Header: { $merge: { Name: item.CMD_Component['@name']  }}}), component: null });
  //       else
  //         this.setState({ component: update(item, { Header: { $merge: { Name: item.CMD_Component['@name']  }}}), profile: null });
  //   }
  // },
  // componentDidMount: function() {
  //   var self = this;
  //   var id = this.getParams().component || this.getParams().profile;
  //
  //   console.log(this.constructor.displayName, 'mounted: ' + id);
  //   console.log('editmode: ' + this.state.editMode);
  //
  //   if(this.props.item != undefined || this.props.item != null)
  //     this.setItemPropToState(this.props.item);
  //
  //   if(this.state.editMode)
  //     if(id != undefined && id != null)
  //       this.loadRegistryItem(id, function(regItem) {
  //         console.log("regItem:" + JSON.stringify(regItem));
  //         self.setState({registry: regItem});
  //       });
  //     else if(this.isActive('newEditor')) {
  //       console.log('Setting up new component...');
  //       this.setItemPropToState({ '@isProfile': "true", Header: { Name: "", Description: "" }, CMD_Component: { "@name": "", "@CardinalityMin": "1", "@CardinalityMax": "1" } });
  //     }
  // },
  addNewAttribute: function(component, evt) {
    // var newAttrObj = { Name: "", Type: "string" }; //TODO check format
    //
    // var attrList = (component.AttributeList != undefined && $.isArray(component.AttributeList.Attribute)) ? component.AttributeList.Attribute : component.AttributeList;
    // if(attrList != undefined && !$.isArray(attrList)) attrList = [attrList];
    //
    // console.log('attrList: ' + attrList);
    // var item = (attrList == undefined) ?
    //   update(component, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
    //   update(component, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });
    //
    // console.log('new item after attr add: ' + JSON.stringify(item));
    // if(this.state.profile != null)
    //   this.setState({ profile: update(this.state.profile, { CMD_Component: { $set: item } }) });
    // else if(this.state.component != null)
    //   this.setState({ component: update(this.state.component, { CMD_Component: { $set: item } }) });
  },
  addNewElement: function(evt) {
    // var elements = update(this.state.childElements, { $push: [ { "@name": "", "@ConceptLink": "", "@ValueScheme": "string", "@CardinalityMin": "1", "@CardinalityMax": "1", "@Multilingual": "false", open: true } ] });
    // this.setState({ childElements: elements });
  },
  addExistingComponent: function(componentId, selectedComps) { //TODO prevent component being added if already exists at that level
    // var self = this;
    // var warningMsg = 'Cannot add existing component that has the same name as a sibling.';
    //
    // this.loadComponent(componentId, "json", function(data) {
    //     console.log('insert data child comp: ' + (data.CMD_Component != null));
    //     data['@ComponentId'] = componentId;
    //     data['open'] = true;
    //
    //     var hasComp = function(comps, compName) {
    //       var foundSibling = false;
    //       if($.isArray(comps))
    //         comps.forEach(function(comp) {
    //           var name = (comp.hasOwnProperty("@name")) ? comp['@name'] : comp.CMD_Component['@name'];
    //           if(name === compName) foundSibling = true;
    //         });
    //       return foundSibling;
    //
    //       //TODO explore jQuery integration with determination of existing name
    //       /*selectedComps.each(function() {
    //         if($(this).find('.inline-body > .childComponents > .CMDComponent').find('.componentLink').text() == compName)) {
    //           alert('Cannot add existing component that has the same name as a sibling.');
    //           foundSibling = true;
    //         }
    //       });*/
    //     };
    //
    //     if(selectedComps == undefined) {
    //       if(hasComp(self.state.childComponents, data.CMD_Component['@name']))
    //         alert(warningMsg);
    //       else {
    //         var updatedComponents = (self.state.childComponents) ? update(self.state.childComponents, { $push: [data] }) : [data];
    //         self.setState({ childComponents: updatedComponents });
    //       }
    //     } else if(self.state.childComponents != null) {
    //       // add component data to selected inline-components
    //       var newComponents = [];
    //
    //       var checkInlineSelection = function(parent, compData) {
    //         if(parent.CMD_Component != undefined && parent.CMD_Component.length > 0) {
    //           var newChildComps = [];
    //           for(var i=0; i < parent.CMD_Component.length; i++) {
    //             var parentCompChild = parent.CMD_Component[i];
    //             if(parentCompChild.selected)
    //               if(hasComp(parentCompChild.CMD_Component, compData.CMD_Component['@name']))
    //                 alert(warningMsg);
    //               else if(parentCompChild.CMD_Component != undefined)
    //                 parentCompChild = update(parentCompChild, { $merge: { CMD_Component: update(parentCompChild.CMD_Component, { $push: [compData] }), open: true } });
    //               else
    //                 parentCompChild = update(parentCompChild, { $merge: { CMD_Component: [compData], open: true } });
    //
    //             newChildComps.push(checkInlineSelection(parentCompChild, data));
    //           }
    //
    //           return update(parent, { CMD_Component: { $set: newChildComps } });
    //         }
    //
    //         return parent;
    //       };
    //
    //       for(var j=0; j < self.state.childComponents.length; j++) {
    //         var comp = self.state.childComponents[j];
    //         if(comp.selected)
    //           if(hasComp(comp.CMD_Component, data.CMD_Component['@name']))
    //             alert(warningMsg);
    //           else if(comp.CMD_Component != undefined)
    //               comp = update(comp, { $merge: { CMD_Component: update(comp.CMD_Component, { $push: [data] }), open: true } });
    //           else comp = update(comp, { $merge: { CMD_Component: [data], open: true } });
    //
    //         comp = update(comp, { $apply: function(c) {
    //             return checkInlineSelection(c, data);
    //         } });
    //
    //         newComponents.push(comp);
    //       }
    //
    //       self.setState({ childComponents: newComponents });
    //     }
    // });
  },
  addNewComponent: function(evt) {
    // var components = update(this.state.childComponents, { $push: [ { "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", open: true } ] });
    // this.setState({ childComponents: components });
  },
  updateAttribute: function(index, newAttr) {
    // console.log('attr update: ' + index);
    // var item = this.state.component || this.state.profile;
    // var attrSet = item.CMD_Component.AttributeList.Attribute;
    // attrSet[index] = newAttr;
    //
    // if(this.state.profile != null)
    //   this.setState({ profile: update(item, { CMD_Component: { AttributeList: { $set: { Attribute: attrSet } }}  }) });
    // else if(this.state.component != null)
    //   this.setState({ component: update(item, { CMD_Component: { AttributeList: { $set: { Attribute: attrSet } }}  }) });
  },
  updateElement: function(index, newElement) {
    // console.log('elem update: ' + index);
    // var childElements = this.state.childElements;
    // if(index >= 0 && index < childElements.length)
    //   if((newElement.elemId == childElements[index].elemId) &&
    //      (JSON.stringify(newElement) != JSON.stringify(childElements[index]))) {
    //     childElements[index] = newElement;
    //     this.setState({childElements: childElements});
    //   }
  },
  updateInlineComponent: function(index, newComponent) {
    // console.log('inline update: ' + index);
    // var childComponents = this.state.childComponents;
    // if(index >= 0 && index < childComponents.length)
    //   if(newComponent != null) this.setState({ childComponents: update(childComponents, { $splice: [[index, 1, newComponent]] }) });
  },
  updateComponentSettings: function(index, newMin, newMax) {
    // console.log('comp update: ' + index, ' new min: ' + newMin, ' new max: ' + newMax);
    //
    // var childComponents = this.state.childComponents;
    // console.log('child to update: ' + JSON.stringify(childComponents[index]));
    //
    // if(newMin != null)
    //   this.setChildComponentProperty(childComponents[index], '@CardinalityMin', newMin);
    // if(newMax != null)
    //   this.setChildComponentProperty(childComponents[index], '@CardinalityMax', newMax);
    //
    // this.setState({childComponents: childComponents});
  },
  setChildComponentProperty : function(childComp, prop, newValue) {
    // if(childComp == null)
    //   return;
    //
    // if(childComp.hasOwnProperty('prop'))
    //   childComp[prop] = newValue;
    // if(childComp.Header != undefined && childComp.CMD_Component != undefined)
    //   if(!$.isArray(childComp.CMD_Component) && childComp.CMD_Component.hasOwnProperty(prop))
    //     childComp.CMD_Component[prop] = newValue;
  },
});

module.exports = ComponentViewer;
