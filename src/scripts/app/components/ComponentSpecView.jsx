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
* @ActionButtonsMixin
* @ValidationMixin
* @Router.Navigation
* @Router.State
*/
var ComponentSpec = React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired,
    spec: React.PropTypes.object.isRequired
  },
  contextTypes: {
    router: React.PropTypes.func,
    //TODO flux: auth context - loggedIn: React.PropTypes.bool.isRequired
  },
  getInitialState: function() {
    return { childElements: null,
             childComponents: null
    };
  },
  mixins: [
    //ImmutableRenderMixin,
    LinkedStateMixin,
    btnGroup, ActionButtonsMixin, ValidationMixin, Router.Navigation, Router.State],

  getDefaultProps: function() {
    return {
      domains: require('../../domains.js')
    };
  },

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
          return (
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

    return valueScheme;
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
      // Component hierarcy: expanded or non-expanded (@ComponentId)
      var self = this,
      rootComponent = item.CMD_Component,
      attrList = null,
      childElem = null,
      childComp = null,
      errors = null;

      var attrSet = (rootComponent && rootComponent.AttributeList != undefined && $.isArray(rootComponent.AttributeList.Attribute)) ? rootComponent.AttributeList.Attribute : rootComponent.AttributeList;

      if(attrSet != undefined)
        attrList = (
          <div className="attrList">AttributeList:
            {
              (attrSet != undefined && attrSet.length > 0)
              ? $.map(attrSet, function(attr, index) {
                var attrId = (attr.attrId != undefined) ? attr.attrId : "root_attr_" + md5.hash("root_attr_" + index + "_" + Math.floor(Math.random()*1000));
                attr.attrId = attrId;
                //TODO attach dialogs to itself as container rather than viewer
                return (
                  <CMDAttribute key={attrId} attr={attr} value={self.getValueScheme.bind(self, attr, self)} conceptRegistryBtn={self.conceptRegistryBtn.bind(self, self)} />
                );
              })
              : <span>No Attributes</span>
            }
          </div>
        );

      if(this.state.childElements != null)
        childElem = (
          <div ref="elements" className="childElements">{this.state.childElements.map(
            function(elem, index) {
              var elemId = (elem.elemId != undefined) ? elem.elemId : "elem_" + md5.hash("elem_" + elem['@name'] + index);
              elem.elemId = elemId;
              return <CMDElement key={elemId} elem={elem} viewer={self} />;
            }
          )}
          </div>
        );

      if(this.state.childComponents != null)
        childComp = (
          // component key should be componentId (except for  inline comps which use generated hash)
          <div ref="components" className="childComponents">{this.state.childComponents.map(
            function(comp, index) {
              var compId;
              if(comp.hasOwnProperty("@ComponentId")) compId = comp['@ComponentId'];
              else if(comp.Header != undefined) compId = comp.Header.ID;
              else compId = (comp.inlineId != undefined) ? comp.inlineId : "inline_" + md5.hash("inline_" + comp['@name'] + index);

              var newComp = comp;
              if(compId.startsWith("inline") && comp.inlineId == undefined)
                newComp = update(newComp, { $merge: { inlineId: compId } });

              return <CMDComponent key={compId} component={newComp} viewer={self} />
            }
          )}
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
          {childElem}
          {childComp}
        </div>
      );
    }
  }
});

module.exports = ComponentSpec;
