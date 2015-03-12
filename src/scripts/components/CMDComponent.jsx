'use strict';

var React = require('react/addons');
var CMDElement = require('./CMDElement');
var update = React.addons.update;

//require('../../styles/CMDComponent.sass');

var CMDComponent = React.createClass({
  getInitialState: function() {
    return { component: this.props.component, parentComponent: this.props.parent }
  },
  toggleComponent: function(evt) {
    this.setState({ component: update(this.state.component, { open: { $set: !this.state.component.open }})});
    //TODO: if component is not loaded, load data before setting new state change
  },
  render: function () {
    //console.log('comp: ' + require('util').inspect(comp));
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

    comp = (header != undefined) ? comp.CMD_Component : comp;

    console.log('comp header: ' + JSON.stringify(header));
    console.log('open: ' + this.state.component.open);

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;
    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);

    var compElems = comp.CMD_Element;
    console.log('comp elems: ' + $.isArray(compElems));

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    if(compElems != undefined)
      compElems = compElems.map(function(elem, index) {
        return <CMDElement key={index} elem={elem} />
      });

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined)
      compComps = compComps.map(function(nestedComp, ncindex) {
        return <CMDComponent key={ncindex} parent={self.state.component} component={nestedComp} viewer={self.props.viewer} />
      });

    var cx = React.addons.classSet;
    var classes = cx({
      'hide': !this.state.component.open,
      'componentBody': true
    });

    if(!this.state.component.open && (compId != null && !comp.hasOwnProperty('@name')))
      compName = this.props.viewer.getItemName(compId); // load name if doesn't exist

    return (
        <div className="CMDComponent">
         <span>Component: </span><a href="#info" onClick={this.toggleComponent}>{compName}</a>
         <div className="componentProps">{compProps}</div>
         <div className={classes}>
           <div className="childElements">{compElems}</div>
           <div className="childComponents">{compComps}</div>
         </div>
        </div>
      );
  }
});

module.exports = CMDComponent;
