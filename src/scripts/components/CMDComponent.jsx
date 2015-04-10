'use strict';

var React = require('react/addons');
var LinkedStateMixin = require('../mixins/LinkedStateMixin.js');
var CMDElement = require('./CMDElement');
var Input = require('react-bootstrap/lib/Input');
var update = React.addons.update;

//require('../../styles/CMDComponent.sass');

var CMDComponent = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState: function() {
    return { component: this.props.component, parentComponent: this.props.parent, editMode: (this.props.editMode != undefined) ? this.props.editMode : false }
  },
  toggleComponent: function(evt) {
    console.log('toggle component: ' + JSON.stringify(this.state.component));

    if((!this.state.component.hasOwnProperty('open') || !this.state.component.open) &&
       this.state.component.hasOwnProperty('@ComponentId'))
      this.loadComponentData();
    else {
      this.setState({ component: update(this.state.component, { open: { $set: !this.state.component.open }})});
    }
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
    var currentComponent = this.state.component;
    console.log('component: ' + JSON.stringify(nextProps.component));

    if(currentComponent.open != nextProps.component.open) {
      currentComponent = update(currentComponent, { open: { $set: nextProps.component.open }});
      this.setState({ component: currentComponent });
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

    console.log('mounted component: ' + JSON.stringify(component));
  },
  componentDidUpdate: function(prevProps, prevState) {
    console.log('component will update');
  },
  render: function () {
    console.log('comp inspect: ' + require('util').inspect(this.state.component, { showHidden: true, depth: null}));

    var self = this;
    var comp = this.state.component;
    var parentComp = this.state.parentComponent;
    var compId;

    if(comp.hasOwnProperty("@ComponentId")) //TODO find cases when ComponentId is missing
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

    //TODO: For viewer work on data load and display of cardinality props
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
        return <CMDElement key={index} elem={elem} viewer={self.props.viewer} editMode={self.state.editMode} />
      });

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined)
      compComps = compComps.map(function(nestedComp, ncindex) {
        console.log('found component (' + ncindex + '): ' + nestedComp);
        return <CMDComponent key={ncindex} parent={self.state.component} component={nestedComp} viewer={self.props.viewer} editMode={self.state.editMode} />
      });

    var cx = React.addons.classSet;
    var classes = cx({
      'hide': !this.state.component.open,
      'componentBody': true
    });

    var editClasses = cx({
      'hide-field': !this.state.component.open && this.state.editMode,
      'componentBody': true
    });

    //TODO: review name replace
    if(!this.state.component.open && (compId != null && !comp.hasOwnProperty('@name')))
      compName = this.props.viewer.getItemName(compId); // load name if doesn't exist

    if(this.state.editMode) {

      var cardOpt = null;
      var minComponentLink = null;
      var maxComponentLink = null;

      if(this.state.component.open) {
        minComponentLink = (this.state.component.Header != undefined && comp.hasOwnProperty("@CardinalityMin")) ? this.linkState('component.CMD_Component.@CardinalityMin') : null;
        maxComponentLink = (this.state.component.Header != undefined && comp.hasOwnProperty("@CardinalityMax")) ? this.linkState('component.CMD_Component.@CardinalityMax') : null;
      } else {
          cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );
      }

      var handleOccMinChange = function(e) {
          console.log('comp change: ' + e.target);
          if(minComponentLink != null) {
            minComponentLink.requestChange(e.target.value);
            if(self.props.onUpdate)
              self.props.onUpdate(e.target.value, self.state.component.CMD_Component['@CardinalityMax']);
          }
      };

      var handleOccMaxChange = function(e) {
        console.log('comp change: ' + e.target);
        if(maxComponentLink != null) {
          maxComponentLink.requestChange(e.target.value);
          if(self.props.onUpdate)
            self.props.onUpdate(self.state.component.CMD_Component['@CardinalityMin'], e.target.value);
        }
      };

      //TODO Add viewer display for components and show form fields for nested children of inline-components 
      return (
        <div className="CMDComponent edit-mode">
          <span>ComponentId: <a className="componentLink" onClick={this.toggleComponent}>{compName}</a></span> {cardOpt}
          <div className={editClasses}>
            <form className="form-horizontal form-group" name={"componentForm_" + compId}>
              <Input type="select" label="Min Occurrences" defaultValue={minC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMinChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option value={index}>{index}</option>
                })}
              </Input>
              <Input type="select" label="Max Occurrences" defaultValue={maxC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMaxChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option value={index}>{index}</option>
                })}
              </Input>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="CMDComponent">
          <span>Component: </span><a className="componentLink" onClick={this.toggleComponent}>{compName}</a>
          <div className="componentProps">{compProps}</div>
          <div className={classes}>
            <div className="childElements">{compElems}</div>
            <div className="childComponents">{compComps}</div>
          </div>
        </div>
      );
    }
  }
});

module.exports = CMDComponent;
