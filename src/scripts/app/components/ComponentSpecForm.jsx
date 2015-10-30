'use strict';
var log = require('loglevel');

var React = require('react/addons');
var Router = require('react-router');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var btnGroup = require('../../mixins/BtnGroupEvents');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDComponentForm = require('./CMDComponentForm');

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
var ComponentSpecForm = React.createClass({
  statics: {
    willTransitionTo: function(transition, params, query) {
      log.debug('attempting transition...' + transition.path);
    },
    willTransitionFrom: function(transition, component) {
      log.debug('transition from...' + this.path);
      // if(component.state.editMode && !component.state.isSaved)
      //   if(!confirm('You have unsaved work. Are you sure you want to cancel?'))
      //     transition.abort();
    }
  },

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    expansionState: React.PropTypes.object,
    linkedComponents: React.PropTypes.object,
    onComponentToggle: React.PropTypes.func,
    onTypeChange: React.PropTypes.func,
    onHeaderChange: React.PropTypes.func
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
    ImmutableRenderMixin, Router.Navigation, Router.State],

  getDefaultProps: function() {
    return {
      domains: require('../../domains.js')
    };
  },
  render: function() {
    var item = this.props.spec;

    if(item == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else {
      var rootClasses = classNames({ ComponentViewer: true });
      var rootComponent = item.CMD_Component;

      // Display properties
      var conceptLink = (rootComponent && rootComponent['@ConceptLink'] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent['@ConceptLink']}>{rootComponent['@ConceptLink']}</a></li> : null;
      var isProfile = (item.hasOwnProperty("@isProfile")) ? (item['@isProfile']=="true") : false;

      return (
        <form ref="editComponentForm" name="editComponent" className="form-horizontal form-group">
          <div className="form-group">
            <Input type="radio" name="isProfile" label="Profile" value={true} defaultChecked={isProfile} onChange={this.handleTypeChange} wrapperClassName="col-xs-offset-1 col-xs-1" />
            <Input type="radio" name="isProfile" label="Component" value={false} defaultChecked={!isProfile} onChange={this.handleTypeChange} wrapperClassName="col-xs-offset-1 col-xs-1" />
          </div>
          <Input type="text" name="name" label="Name" defaultValue={item.Header.Name} onChange={this.handleHeaderChange} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {//groupNameInput}
          }
          <Input type="textarea" name="description" label="Description" defaultValue={item.Header.Description} onChange={this.handleHeaderChange} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          {//domainNameInput
          }
          {
          //<Input ref="conceptRegInput" type="text" label="ConceptLink" value={(rootComponent['@ConceptLink']) ? rootComponent['@ConceptLink'] : ""} buttonAfter={this.conceptRegistryBtn(this)} labelClassName="col-xs-1" wrapperClassName="col-xs-3" onChange={this.updateConceptLink} readOnly />
          }
            <CMDComponentForm
              spec={item.CMD_Component}
              hideProperties={true}
              onToggle={this.props.onComponentToggle}
              expansionState={this.props.expansionState}
              linkedComponents={this.props.linkedComponents}
              />
          </form>
        );
    }
  },

  handleTypeChange: function(e) {
    //event target = input "isProfile"
    var isProfile = (e.target.value === "true") ;
    var type = isProfile ? Constants.TYPE_PROFILE : Constants.TYPE_COMPONENTS;
    this.props.onTypeChange(type);
  },

  handleHeaderChange: function(e) {
    //pass changes to handler, input name maps to field name
    var field = e.target.name;
    var value = e.target.value;
    this.props.onHeaderChange({[field]: value});
  },

  //below: old functions
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

module.exports = ComponentSpecForm;
