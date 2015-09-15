'use strict';

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDElement = require('./CMDElement');
var CMDAttribute = require('./CMDAttribute');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/CMDComponent.sass');

/**
* CMDComponent - view display and editing form for a CMDI Component item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentView = React.createClass({
  mixins: [ImmutableRenderMixin, LinkedStateMixin],
  propTypes: {
    spec: React.PropTypes.object.isRequired,
    open: React.PropTypes.bool,
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
    key: React.PropTypes.string
  },
  getDefaultProps: function() {
      return {
        open: true,
        openAll: false,
        closeAll: false
      };
    },
  getInitialState: function() {
    return {
            //  component: this.props.component,
            //  componentName: (this.props.component.Header != undefined) ? this.props.component.Header.Name : null,
            //  editMode: (this.props.editMode != undefined) ? this.props.editMode : false,
            //  isInline: false,
            //  isSelected: (this.props.component.selected != undefined) ? this.props.component.selected : false
          };
  },
  toggleComponent: function(evt) {
    // console.log('toggle component: ' + JSON.stringify(this.props.spec));
    // if((!this.state.component.hasOwnProperty('open') || !this.state.component.open) &&
    //    this.state.component.hasOwnProperty('@ComponentId') && this.state.component.Header == undefined)
    //    this.loadComponentData();
    // else {
    //   var isOpen = (this.state.component.hasOwnProperty('open')) ? !this.state.component.open : true;
    //   this.setState({ component: update(this.state.component, { open: { $set: isOpen }}) });
    // }
  },

  render: function () {
    //console.log('comp inspect: ' + require('util').inspect(this.state.component, { showHidden: true, depth: null}));

    var self = this;
    var comp = this.props.spec;

    var compId;
    if(comp.hasOwnProperty("@ComponentId"))
      compId = comp["@ComponentId"];
    else if(comp.Header != undefined)
      compId = comp.Header.ID;
    else
      compId = null;

    console.log('render', this.constructor.displayName, (compId != null) ? compId : 'inline');

    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name']; // TODO: use @name attr only

    if(header != undefined && comp.CMD_Component != undefined)
      comp = comp.CMD_Component;

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    // console.log('comp header: ', (header != undefined) ? JSON.stringify(header) : 'none');
    // console.log('open: ', (this.state.component.open != undefined) ? this.state.component.open : 'false');

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);
    var compElems = comp.CMD_Element;

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    if(compElems != undefined)
      compElems = compElems.map(function(elem, index) {
        console.log('found elem (' + index + '): ' + elem);
        var elemId = (elem.elemId != undefined) ? elem.elemId : "comp_elem_" + md5.hash("comp_elem_" + elem['@name'] + "_" + index + "_" + Math.floor(Math.random()*1000));
        elem.elemId = elemId;
        //TODO return <CMDElementView key={elemId} spec="elem" />
        return <span>{elemId}</span>
      });

    if(!this.props.open && (compId != null && !comp.hasOwnProperty('@name') && this.props.componentName != null))
       compName = this.props.componentName;
    else if(comp.hasOwnProperty("@name"))
      compName = (comp['@name'] == "") ? "[New Component]" : comp['@name'];

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined)
      compComps = compComps.map(function(nestedComp, ncindex) {
        console.log('found component (' + ncindex + '): ' + nestedComp);

        var compId;
        if(nestedComp.hasOwnProperty("@ComponentId")) compId = nestedComp['@ComponentId'];
        else if(nestedComp.Header != undefined) compId = nestedComp.Header.ID;
        else compId = (nestedComp.inlineId != undefined) ? nestedComp.inlineId : "inline_" + md5.hash("inline_" + nestedComp['@name'] + "_" + ncindex + "_" + Math.floor(Math.random()*1000));

        var newNestedComp = nestedComp;
        if(compId.startsWith("inline") && nestedComp.inlineId == undefined)
          newNestedComp = update(newNestedComp, { $merge: { inlineId: compId } });

        console.log('compId: ' + compId);

        return <CMDComponentView key={compId} parent={self.props.spec} spec={nestedComp} />
      });

    // classNames
    var viewClasses = classNames('componentBody', { 'hide': !this.props.open });
    var componentClasses = classNames('CMDComponent', { 'open': this.props.open, 'selected': this.props.isSelected });

    var attrSet = (comp.AttributeList != undefined && $.isArray(comp.AttributeList.Attribute)) ? comp.AttributeList.Attribute : comp.AttributeList;
    var addAttrLink = null;
    //var selectionLink = (this.state.isInline) ? <div className="controlLinks"><a onClick={this.toggleSelection}>{(this.state.isSelected) ? "unselect" : "select"}</a></div> : null;
    var attrList = (
      <div className="attrList">AttributeList:
        {
          (attrSet != undefined && attrSet.length > 0)
          ? $.map(attrSet, function(attr, index) {
            var attrId = (attr.attrId != undefined) ? attr.attrId : "comp_attr_" + md5.hash("comp_attr_" + index + "_" + Math.floor(Math.random()*1000));
            attr.attrId = attrId;
            return (
              //TODO <CMDAttribute key={attrId} attr={attr} value={self.props.viewer.getValueScheme.bind(self.props.viewer, attr, self)} />
              <span>{attrId}</span>
            );
          })
          : <span> No Attributes</span>
        }
      </div>
    );

    return (
      <div className={componentClasses}>
        <span>Component: </span><a className="componentLink" onClick={this.toggleComponent}>{compName}</a>
        <div className="componentProps">{compProps}</div>
        <div className={viewClasses}>
          {attrList}
          <div className="childElements">{compElems}</div>
          <div ref="components" className="childComponents">{compComps}</div>
        </div>
      </div>
    );
  }
  // componentWillReceiveProps: function(nextProps) {
  //   console.log(this.constructor.displayName, 'will received new props');
  //
  //   var component = this.state.component;
  //   //console.log('component props: ' + JSON.stringify(nextProps.component));
  //
  //   if(this.state.isInline &&
  //      ((nextProps.component.open && nextProps.component.selected) ||
  //       JSON.stringify(this.state.component) != JSON.stringify(nextProps.component))) // TODO require state update if new component added to nested inline child
  //     this.setState({ component: update(nextProps.component, { open: { $set: (this.state.component != nextProps.component.open) ? nextProps.component.open : true } }) });
  //   else if(nextProps.component.hasOwnProperty('open') && (this.state.component.open != nextProps.component.open)) { // open/close all
  //     component = update(component, { open: { $set: nextProps.component.open }});
  //     this.setState({ component: component });
  //   }
  // },
  // componentWillMount: function() {
  //   console.log(this.constructor.displayName, 'will mount');
  //
  //   var comp = this.state.component;
  //   if(!comp.hasOwnProperty("@ComponentId") && comp.Header != undefined)
  //     comp = comp.CMD_Component;
  //
  //   if(!comp.hasOwnProperty("@CardinalityMin")) comp = update(comp, { '@CardinalityMin': { $set: 1 } });
  //   if(!comp.hasOwnProperty("@CardinalityMax")) comp = update(comp, { '@CardinalityMax': { $set:  1 } });
  //
  //   if(!comp.hasOwnProperty("@CardinalityMin") || !comp.hasOwnProperty("@CardinalityMax"))
  //     this.setState({ component: update(this.state.component, { CMD_Component: { $set: comp } }) });
  // },
  // componentDidMount: function() {
  //   console.log(this.constructor.displayName, 'did mount');
  //
  //   var self = this;
  //   var component = this.state.component;
  //
  //   //TODO review single-object to array conversion - immutable data method
  //   if(component.CMD_Element != undefined && !$.isArray(component.CMD_Element)) {
  //     component.CMD_Element = [component.CMD_Element];
  //     //component = update(component, { CMD_Element: { $set: [component.CMD_Element] } });
  //   }
  //
  //   if(component.CMD_Component != undefined && !$.isArray(component.CMD_Component)) {
  //     if(component.Header == undefined)
  //       component.CMD_Component = [component.CMD_Component];
  //       //component = update(component, { CMD_Component: { $set: [component.CMD_Component] } });
  //     else if(component.CMD_Component.CMD_Element != undefined && !$.isArray(component.CMD_Component.CMD_Element))
  //       component.CMD_Component.CMD_Element = [component.CMD_Component.CMD_Element];
  //       //component = update(component, { CMD_Component: { CMD_Element: { $set: [component.CMD_Component.CMD_Element] } }});
  //   }
  //
  //   if(component.AttributeList != undefined && !$.isArray(component.AttributeList.Attribute)) {
  //     component = update(component, { AttributeList: { Attribute: { $set: [component.AttributeList.Attribute]} }});
  //   } else if($.isArray(component.AttributeList))
  //     component = update(component, { AttributeList: { Attribute: { $set: component.AttributeList } }});
  //
  //   if(!component.hasOwnProperty("@ComponentId") && component.inlineId != undefined)
  //       this.setState({ isInline: true, component: update(component, { open: { $set: true }}) }, function() {
  //         self.props.onInlineUpdate(component);
  //       });
  //   else
  //     this.setState({ component: component });
  //
  //   //console.log('mounted component: ' + JSON.stringify(component));
  // },
  // componentDidUpdate: function(prevProps, prevState) {
  //   console.log(this.constructor.displayName, 'did update: ', (this.state.isInline) ? this.state.component.inlineId : this.state.component['@ComponentId']);
  //
  //   var self = this;
  //   if(!this.state.isInline && this.state.componentName == null && this.state.component.Header == undefined)
  //     this.props.viewer.getItemName(this.state.component['@ComponentId'], function(name) {
  //       self.setState({ component: update(self.state.component, { $merge: { "@name": name } }), componentName: name }, function() {
  //         if(self.props.updateParent != undefined) self.props.updateParent(self.state.component);
  //       });
  //     });
  // },

});

module.exports = CMDComponentView;
