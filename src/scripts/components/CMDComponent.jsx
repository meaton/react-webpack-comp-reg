'use strict';

var React = require('react/addons');
var LinkedStateMixin = require('../mixins/LinkedStateMixin.js');
var CMDElement = require('./CMDElement');
var Input = require('react-bootstrap/lib/Input');
var update = React.addons.update;

require('../../styles/CMDComponent.sass');

var CMDComponent = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState: function() {
    return { component: this.props.component, editMode: (this.props.editMode != undefined) ? this.props.editMode : false, isInline: false }
  },
  toggleComponent: function(evt) {
    console.log('toggle component: ' + JSON.stringify(this.state.component));
    if((!this.state.component.hasOwnProperty('open') || !this.state.component.open) &&
       this.state.component.hasOwnProperty('@ComponentId'))
       this.loadComponentData();
    else {
      var isOpen = (this.state.component.hasOwnProperty('open')) ? !this.state.component.open : true;
      this.setState({ component: update(this.state.component, { open: { $set: isOpen }}) });
    }
  },
  addNewComponent: function(evt) {
    var component = this.state.component;
    if(component.CMD_Component == undefined) component.CMD_Component = [];
    component.CMD_Component = update(component.CMD_Component, { $push: [ { "@name": "", "@ConceptLink": "", "@CardinalityMin": "1", "@CardinalityMax": "1", open: true } ] });

    this.setState({ component: component });
  },
  updateComponentSettings: function(index, newMin, newMax) {
    console.log('comp update: ' + index);
    var component = this.state.component;
    var child = (component.Header != undefined) ? component.CMD_Component.CMD_Component[index] : component.CMD_Component[index];

    if(newMin != null) child['@CardinalityMin'] = newMin;
    if(newMax != null) child['@CardinalityMax'] = newMax;

    var linkChild = this.linkState('component.' + index);
    linkChild.requestChange(child);
  },
  updateInlineComponent: function(index, newComponent) {
    console.log('update nested component: ' + require('util').inspect(newComponent));
    var linkChild = (this.state.component.Header != undefined) ?
      this.linkState('component.CMD_Component.CMD_Component.' + index) :
      this.linkState('component.CMD_Component.' + index);
    linkChild.requestChange(newComponent);
  },
  loadComponentData: function() {
    var self = this;
    var comp = this.state.component;

    this.props.viewer.loadComponent(this.state.component["@ComponentId"], "json", function(data) { //TODO: use common load child Component spec fn callback as in viewer
          console.log('data child comp: ' + (data.CMD_Component != null));
          data.CMD_Component = update(data.CMD_Component, { $merge: {'@CardinalityMin': (comp.hasOwnProperty("@CardinalityMin")) ? comp["@CardinalityMin"] : 1, '@CardinalityMax': (comp.hasOwnProperty("@CardinalityMax")) ? comp["@CardinalityMax"] : 1}})

          var newComponent = update(data, {open: {$set: true}})
          self.setState({component: newComponent });
      });
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('component will received new props');
    var component = this.state.component;
    console.log('component props: ' + JSON.stringify(nextProps.component));

    if(this.props.component.open != nextProps.component.open) { // open/close all
      component = update(component, { open: { $set: nextProps.component.open }});
      this.setState({ component: component });
    }
  },
  componentWillMount: function() {
    console.log('component will mount');
    var comp = this.state.component;
    if(!comp.hasOwnProperty("@ComponentId") && comp.Header != undefined)
      comp = comp.CMD_Component;

    if(!comp.hasOwnProperty("@CardinalityMin")) comp['@CardinalityMin'] = 1;
    if(!comp.hasOwnProperty("@CardinalityMax")) comp['@CardinalityMax'] = 1;
  },
  componentDidMount: function() {
    console.log('component did mount');
    var component = this.state.component;

    if(component.CMD_Element != undefined && !$.isArray(component.CMD_Element)) {
      component.CMD_Element = [component.CMD_Element];
    }

    if(component.CMD_Component != undefined && !$.isArray(component.CMD_Component)) {
      if(component.Header == undefined)
        component.CMD_Component = [component.CMD_Component];
      else if(component.CMD_Component.CMD_Element != undefined && !$.isArray(component.CMD_Component.CMD_Element))
        component.CMD_Component.CMD_Element = [component.CMD_Component.CMD_Element];
    }

    if(component.AttributeList != undefined && !$.isArray(component.AttributeList.Attribute)) {
      component.AttributeList.Attribute = [component.AttributeList.Attribute];
    } else if($.isArray(component.AttributeList))
      component.AttributeList.Attribute = component.AttributeList;

    if(!component.hasOwnProperty("@ComponentId") && component.hasOwnProperty("@name"))
        this.setState({ isInline: true, component: update(component, { open: { $set: true }}) });

    console.log('mounted component: ' + JSON.stringify(component));
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('component will update: ' + require('util').inspect(nextState.component));
    if(this.state.editMode && this.state.isInline && this.state.component.open)
          if(JSON.stringify(nextProps.component) != JSON.stringify(nextState.component)) {
            this.props.onInlineUpdate(nextState.component);
          }
  },
  render: function () {
    console.log('comp inspect: ' + require('util').inspect(this.state.component, { showHidden: true, depth: null}));
    var self = this;
    var comp = this.state.component;
    var compId;

    if(comp.hasOwnProperty("@ComponentId"))
      compId = comp["@ComponentId"];
    else if(comp.Header != undefined)
      compId = comp.Header.ID;
    else
      compId = null;

    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name']; // TODO: use @name attr only

    if(header != undefined && comp.CMD_Component != undefined)
      comp = comp.CMD_Component;

    if($.isArray(comp) && comp.length == 1)
      comp = comp[0];

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    console.log('comp header: ' + JSON.stringify(header));
    console.log('open: ' + this.state.component.open);

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);
    var compElems = comp.CMD_Element;

    console.log('comp elems: ' + $.isArray(compElems));

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    console.log('comp elems: ' + $.isArray(compElems));

    if(compElems != undefined)
      compElems = compElems.map(function(elem, index) {
        console.log('found elem (' + index + '): ' + elem);
        return <CMDElement key={"comp_elem_" + index} elem={elem} viewer={self.props.viewer} editMode={self.state.editMode} />
      });

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined)
      compComps = compComps.map(function(nestedComp, ncindex) {
        console.log('found component (' + ncindex + '): ' + nestedComp);
        return <CMDComponent key={"comp_comp_" + ncindex} parent={self.state.component} component={nestedComp} viewer={self.props.viewer} editMode={self.state.editMode} onInlineUpdate={self.updateInlineComponent.bind(self, ncindex)} onUpdate={self.updateComponentSettings.bind(self, ncindex)} />
      });

    var cx = React.addons.classSet;
    var viewClasses = cx({
      'componentBody': true,
      'hide': !this.state.component.open
    });

    var editClasses = cx({
      'componentBody': true,
      'hide-field': !this.state.component.open && this.state.editMode
    });

    var componentClasses = cx({
      'CMDComponent': true,
      'edit-mode': this.state.editMode,
      'open': this.state.component.open
    });

    //TODO: review name replace
    if(!this.state.component.open && (compId != null && !comp.hasOwnProperty('@name')))
      compName = this.props.viewer.getItemName(compId); // load name if doesn't exist
    else if(comp.hasOwnProperty("@name") && comp['@name'] === "")
      compName = "[missing name]";

    if(this.state.editMode) {
      var cardOpt = null;
      var minComponentLink = null;
      var maxComponentLink = null;

      if(this.state.component.open) {
        minComponentLink = (this.state.component.Header != undefined && comp.hasOwnProperty("@CardinalityMin")) ? this.linkState('component.CMD_Component.@CardinalityMin') : this.linkState('component.@CardinalityMin');
        maxComponentLink = (this.state.component.Header != undefined && comp.hasOwnProperty("@CardinalityMax")) ? this.linkState('component.CMD_Component.@CardinalityMax') : this.linkState('component.@CardinalityMax');
      } else {
          cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );
      }

      var componentProps = null;
      if(compId == null) {
        var nameLink = this.linkState('component.@name'); //TODO bind conceptLink

        //inline component props
        componentProps = (
          <div>
            <Input type="text" label="Name" defaultValue={this.state.component['@name']} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, nameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            <Input type="text" label="ConceptLink" value={this.state.component['@ConceptLink']} buttonAfter={this.props.viewer.conceptRegistryBtn()} labelClassName="col-xs-1" wrapperClassName="col-xs-3" />
          </div>
        );
        //TODO move common viewer bind methods to mixin
      }

      var handleOccMinChange = function(e) {
          console.log('comp change: ' + e.target);
          if(minComponentLink != null) {
            minComponentLink.requestChange(e.target.value);

            if(self.props.onUpdate)
              self.props.onUpdate(e.target.value, null);
          }
      };

      var handleOccMaxChange = function(e) {
        console.log('comp change: ' + e.target);
        if(maxComponentLink != null) {
          maxComponentLink.requestChange(e.target.value);

          if(self.props.onUpdate)
            self.props.onUpdate(null, e.target.value);
        }
      };

      var cmdInlineBody = (this.state.isInline) ?
        (
          <div className="inline-body">
            <div className="childElements">{compElems}
              <div className="addElement"><a onClick={this.addNewElement}>+Element</a></div>
            </div>
            <div className="childComponents">{compComps}
              <div className="addComponent"><a onClick={self.addNewComponent}>+Component</a></div>
            </div>
          </div>
        ): null;

      return (
        <div className={componentClasses}>
          <span>ComponentId: <a className="componentLink" onClick={this.toggleComponent}>{compName}</a></span> {cardOpt}
          <div className={editClasses}>
            <form className="form-horizontal form-group" name={"componentForm_" + compId}>
              {componentProps}
              <Input type="select" label="Min Occurrences" defaultValue={minC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMinChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option key={index} value={index}>{index}</option>
                })}
              </Input>
              <Input type="select" label="Max Occurrences" defaultValue={maxC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMaxChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option key={index} value={index}>{index}</option>
                })}
              </Input>
            </form>
            {cmdInlineBody}
          </div>
        </div>
      );
    } else {
      return (
        <div className={componentClasses}>
          <span>Component: </span><a className="componentLink" onClick={this.toggleComponent}>{compName}</a>
          <div className="componentProps">{compProps}</div>
          <div className={viewClasses}>
            <div className="childElements">{compElems}</div>
            <div className="childComponents">{compComps}</div>
          </div>
        </div>
      );
    }
  }
});

module.exports = CMDComponent;
