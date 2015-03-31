'use strict';

var React = require('react/addons');
var CMDElement = require('./CMDElement');
var update = React.addons.update;

//require('../../styles/CMDComponent.sass');

var CMDComponent = React.createClass({
  getInitialState: function() {
    return { component: this.props.component, parentComponent: this.props.parent, editMode: (this.props.editMode != undefined) ? this.props.editMode : false }
  },
  toggleComponent: function(evt) {
    var self = this;
    if(!this.state.component.hasOwnProperty('open') && this.state.component.hasOwnProperty('@ComponentId'))
      this.props.viewer.loadComponent(this.state.component["@ComponentId"], "json", function(data) {
            console.log('data child comp: ' + (data.CMD_Component != null));
            self.setState({component: update(data, {open: {$set: true}}) });
        });
    else
      this.setState({ component: update(this.state.component, { open: { $set: !this.state.component.open }})});
  },
  render: function () {
    console.log('comp inspect: ' + require('util').inspect(this.state.component));
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

    var minC = (comp.hasOwnProperty('@CardinalityMin')) ? comp['@CardinalityMin'] : 1;
    var maxC = (comp.hasOwnProperty('@CardinalityMax')) ? comp['@CardinalityMax'] : 1;

    if(this.state.editMode)
      return (
        <div>ComponentId: {compName} Cardinality: {minC + " - " + maxC}</div>
      );

    console.log('comp header: ' + JSON.stringify(header));
    console.log('open: ' + this.state.component.open);

    var compProps = (<div>Number of occurrences: {minC + " - " + maxC}</div>);

    var compElems = comp.CMD_Element;
    console.log('comp elems: ' + $.isArray(compElems));

    if(!$.isArray(compElems) && compElems != undefined)
      compElems = [compElems];

    if(compElems != undefined)
      compElems = compElems.map(function(elem, index) {
        return <CMDElement key={index} elem={elem} viewer={self.props.viewer} editMode={self.state.editMode} />
      });

    var compComps = comp.CMD_Component;

    if(!$.isArray(compComps) && compComps != undefined)
      compComps = [compComps];

    if(compComps != undefined)
      compComps = compComps.map(function(nestedComp, ncindex) {
        return <CMDComponent key={ncindex} parent={self.state.component} component={nestedComp} viewer={self.props.viewer} editMode={self.state.editMode} />
      });

    var cx = React.addons.classSet;
    var classes = cx({
      'hide': !this.state.component.open,
      'componentBody': true
    });

    if(!this.state.component.open && (compId != null && !comp.hasOwnProperty('@name')))
      compName = this.props.viewer.getItemName(compId); // load name if doesn't exist

    //TODO: incl component attributes (root level, other)

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
});

module.exports = CMDComponent;
