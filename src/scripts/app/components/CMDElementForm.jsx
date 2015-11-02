'use strict';

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
// var LinkedStateMixin = require('../../mixins/LinkedStateMixin');
// var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDAttributeForm = require('./CMDAttributeForm');
var ValueScheme = require('./ValueScheme');

//utils
var classNames = require('classnames');

require('../../../styles/CMDElement.sass');

/**
* CMDElement - view display and editing form for a CMDI Element item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDElementForm = React.createClass({
  // mixins: [ImmutableRenderMixin, LinkedStateMixin, ActionButtonsMixin],
  // getInitialState: function() {
  //   return { elem: this.props.elem, editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
  // },

  mixins: [ImmutableRenderMixin],

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    open: React.PropTypes.bool,
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
    key: React.PropTypes.string,
    expansionState: React.PropTypes.object,
    onElementChange: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      open: true,
      openAll: false,
      closeAll: false
    };
  },
  toggleElement: function(evt) {
    //TODO flux: action
    // console.log('toggle elem: ' + JSON.stringify(this.state.elem));
    // var isOpen = (this.state.elem.hasOwnProperty('open')) ? !this.state.elem.open : true;
    // this.setState({ elem: update(this.state.elem, { open: { $set: isOpen }}) });
  },
  elemAttrs: function(elem) {
    var lb = React.createElement('br');
    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : 1;
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : 1;
    var docu_attr = (elem.hasOwnProperty("@Documentation")) ? [React.createElement("span", { className: "attrElem" }, "Documentation: " + elem['@Documentation']), lb] : null;
    var display_attr = (elem.hasOwnProperty("@DisplayPriority")) ? [React.createElement("span", { className: "attrElem" }, "DisplayPriority: " + elem['@DisplayPriority']), lb] : null;
    var conceptLink_attr = (elem.hasOwnProperty("@ConceptLink")) ? [React.createElement("span", { className: "attrElem" }, "ConceptLink: ", new React.createElement("a", { href: elem['@ConceptLink'], target: "_blank" }, elem['@ConceptLink']) ), lb] : null;
    var multilingual_attr = (elem.hasOwnProperty('@Multilingual')) ? [React.createElement("span", { className: "attrElem" }, "Multilingual: " + elem['@Multilingual']), lb]: null;
    var card_attr = [React.createElement('span', { className: "attrElem" }, "Number of occurrences: " + minC + " - " + maxC), lb];

    return {conceptLink_attr, docu_attr, display_attr, card_attr, multilingual_attr};
  },

  renderAttributes: function(elem) {
    var attrSet = (elem.AttributeList != undefined && $.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
    if(attrSet != undefined) {
      return (
        <div className="attrList">AttributeList:
          {
            (attrSet != undefined && attrSet.length > 0) ?
            $.map(attrSet, function(attr, index) {
              var attrId = (attr.attrId != undefined) ? attr.attrId : "attr_elem_" + md5.hash("attr_elem_" + index + "_" + Math.floor(Math.random()*1000));
              attr.attrId = attrId;
              log.debug("Attr", attr);
              return <CMDAttributeForm key={attr._appId} spec={attr} />
            }) : <span>No Attributes</span>
          }
        </div>);
    } else {
      return <span>oops</span>;
    }
  },

  render: function () {
    var self = this;
    var actionButtons = null;//TODO: this.getActionButtons();

    var elem = this.props.spec;
    var elemInspect = elem.elemId; // require('util').inspect(elem);

    var valueScheme = null; //TODO: this.props.viewer.getValueScheme(elem, this);

    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : "1";
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : "1";
    var cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );

    // classNames
    var elementClasses = classNames('CMDElement', { 'edit-mode': true, 'open': true });
    var elemName = (elem['@name'] == "") ? "[New Element]" : elem['@name'];

    // elem props
    var elemProps = (
      <div className="elementProps">
        <Input type="text" name="@name" label="Name" value={elem['@name']} onChange={this.updateElementValue} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
        <Input ref="conceptRegInput" name="@ConceptLink" type="text" label="ConceptLink" value={(elem['@ConceptLink']) ? elem['@ConceptLink'] : ""}  onChange={this.updateElementValue}
          labelClassName="col-xs-1" wrapperClassName="col-xs-3" readOnly /> {/*TODO buttonAfter={this.props.viewer.conceptRegistryBtn(this)} */}
        <Input type="text" name="@Documentation" label="Documentation" value={elem['@Documentation']} onChange={this.updateElementValue} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
        <Input type="number" name="@DisplayPriority" label="DisplayPriority" min={0} max={10} step={1} value={(elem.hasOwnProperty('@DisplayPriority')) ? elem['@DisplayPriority'] : 0} onChange={this.updateElementValue} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
        {valueScheme}
        <Input type="checkbox" name="@Multilingual" label="Multilingual" checked={(elem.hasOwnProperty('@Multilingual')) ? elem['@Multilingual'] == "true" : false} onChange={this.updateElementSelectValue} wrapperClassName="col-xs-2 col-xs-offset-1" />
      </div>
    );

    //for cardinality
    var maxOccDisabled = (elem.hasOwnProperty('@Multilingual') && elem['@Multilingual'] == "true");//TODO && maxC == "unbounded");
    var integerOpts = $.map($(Array(10)), function(item, index) {
      return <option key={index} value={index}>{index}</option>
    });

    //putting it all together...
    return (
      <div className={elementClasses}>
         {actionButtons}
        <span>Element: <a className="elementLink" onClick={this.toggleElement}>{elemName}</a></span> {cardOpt}
        <div className="form-horizontal form-group">
          {elemProps}
          <Input type="select" name="@CardinalityMin" label="Min Occurrences" value={minC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={this.updateElementValue}>
            {integerOpts /*TODO: max @CardinalityMax*/}
          </Input>
          <Input type="select" name="@CardinalityMax" label="Max Occurrences" value={maxC} disabled={maxOccDisabled} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={this.updateElementValue}>
            {integerOpts /*TODO: min @CardinalityMin*/}
            <option value="unbounded">unbounded</option>
          </Input>
        </div>
        {this.renderAttributes(elem)}
        <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute}>+Attribute</a></div>
      </div>
    );
  },

  updateElementValue: function(e) {
    this.propagateValue(e.target.name, e.target.value);
  },

  updateElementSelectValue: function(e) {
    var value = e.target.checked ? "true":"false";
    this.propagateValue(e.target.name, value);
  },

  propagateValue: function(field, value) {
    this.props.onElementChange({$merge: {[field]: value}});
  },

















  //below: old functions
  // componentWillReceiveProps: function(nextProps) {
  //   console.log(this.constructor.displayName, 'will received new props');
  //   var elem = this.state.elem;
  //
  //   //console.log('elem props: ' + JSON.stringify(nextProps.elem));
  //   //console.log('elem props: ' + this.props.elem.open);
  //
  //   if(nextProps.elem.hasOwnProperty('open') && (this.state.elem.open != nextProps.elem.open)) { // open/close all
  //     elem = update(elem, { open: { $set: nextProps.elem.open }});
  //     this.setState({ elem: elem });
  //   }
  // },
  // componentDidMount: function() {
  //   var elem = this.state.elem;
  //   if(elem.AttributeList != undefined && !$.isArray(elem.AttributeList.Attribute))
  //     elem = update(elem, { AttributeList: { Attribute: { $set: [elem.AttributeList.Attribute] } }});
  //   if(elem.ValueScheme != undefined)
  //     var enumVal = elem.ValueScheme.enumeration;
  //     if(enumVal != undefined && enumVal.item != undefined && !$.isArray(enumVal.item))
  //       elem = update(elem, { ValueScheme: { enumeration: { item: { $set: [enumVal.item] } }}});
  //
  //   this.setState({ elem: update(elem, { open: { $set: true }}) });
  //   console.log('mounted element: ' + JSON.stringify(elem));
  // },
  // componentWillUpdate: function(nextProps, nextState) {
  //   console.log(this.constructor.displayName, 'will update: ' + nextState.elem.elemId);
  // },
  // componentDidUpdate: function(prevProps, prevState) {
  //   console.log(this.constructor.displayName, 'did update: ' + this.state.elem.elemId);
  //   //console.log(JSON.stringify(this.props.elem));
  //   //console.log(JSON.stringify(this.state.elem));
  //   if(JSON.stringify(this.state.elem) != JSON.stringify(prevState.elem))
  //     this.props.onUpdate(this.state.elem);
  // },
  updateAttribute: function(index, newAttr) {
    console.log('attr update: ' + index);
    var elem = this.state.elem;
    var attrSet = ($.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;

    if($.isArray(elem.AttributeList.Attribute))
      attrSet[index] = newAttr;
    else
      attrSet = [newAttr];

    if(elem != null)
      this.setState({ elem: update(elem, { AttributeList: { $set: { Attribute: attrSet } } }) });
  },
  addNewAttribute: function(evt) {
    var newAttrObj = { Name: "", Type: "string" }; //TODO check format

    var elem = this.state.elem;
    var attrList = (elem.AttributeList != undefined && $.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
    if(attrList != undefined && !$.isArray(attrList))
      attrList = [attrList];

    console.log('attrList: ' + attrList);
    var elem = (attrList == undefined) ?
      update(elem, { AttributeList: { $set: { Attribute: [newAttrObj] }} }) :
      update(elem, { AttributeList: { $set: { Attribute: update(attrList, { $push: [newAttrObj] }) } } });

    console.log('new item after attr add: ' + JSON.stringify(elem));
    if(this.state.elem != null)
      this.setState({ elem: elem });
  },
  updateConceptLink: function(link, newValue) {
    if(typeof newValue === "string" && this.state.elem != null)
      link.requestChange(newValue);
  },
  // render: function () {
  //   var self = this;
  //   var attrList = null;
  //   var actionButtons = this.getActionButtons();
  //
  //   var elem = this.state.elem;
  //   var elemInspect = elem.elemId; // require('util').inspect(elem);
  //   console.log('rendering element: ',  elemInspect);
  //
  //   var valueScheme = this.props.viewer.getValueScheme(elem, this);
  //
  //   var attrSet = (elem.AttributeList != undefined && $.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
  //   if(elem.AttributeList != undefined || this.state.editMode) {
  //     attrList = (
  //       <div className="attrList">AttributeList:
  //         {
  //           (attrSet != undefined && attrSet.length > 0) ?
  //           $.map(attrSet, function(attr, index) {
  //             var attrId = (attr.attrId != undefined) ? attr.attrId : "attr_elem_" + md5.hash("attr_elem_" + index + "_" + Math.floor(Math.random()*1000));
  //             attr.attrId = attrId;
  //             return <CMDAttribute key={attrId} attr={attr} value={self.props.viewer.getValueScheme.bind(self.props.viewer, attr, self)} conceptRegistryBtn={self.props.viewer.conceptRegistryBtn.bind(self.props.viewer, self)} editMode={self.state.editMode} onUpdate={self.updateAttribute.bind(self, index)} onRemove={self.removeAttribute.bind(self, index)} />;
  //           }) : <span>No Attributes</span>
  //         }
  //       </div>);
  //   }
  //
  //   if(this.state.editMode) {
  //     var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : "1";
  //     var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : "1";
  //     var cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );
  //
  //     // classNames
  //     var elementClasses = classNames('CMDElement', { 'edit-mode': this.state.editMode, 'open': this.state.elem.open });
  //     var elemName = (elem['@name'] == "") ? "[New Element]" : elem['@name'];
  //
  //     // linked state
  //     var nameLink = this.linkState('elem.@name');
  //     var minComponentLink = this.linkState('elem.@CardinalityMin');
  //     var maxComponentLink = this.linkState('elem.@CardinalityMax');
  //     var conceptLinkLink = this.linkState('elem.@ConceptLink');
  //     var docuLink = this.linkState('elem.@Documentation');
  //     var displayPriorityLink = this.linkState('elem.@DisplayPriority');
  //     var multiLink = this.linkState('elem.@Multilingual');
  //
  //     var handleOccMinChange = function(e) {
  //         console.log('comp change: ' + e.target);
  //         if(minComponentLink != null) {
  //           minComponentLink.requestChange(e.target.value);
  //         }
  //     };
  //
  //     var handleOccMaxChange = function(e) {
  //       console.log('comp change: ' + e.target);
  //       if(maxComponentLink != null) {
  //         maxComponentLink.requestChange(e.target.value);
  //       }
  //     };
  //
  //     var handleMultiChange = function(e) {
  //       console.log('multi change: ' + (e.target.checked));
  //       if(multiLink != null)
  //         multiLink.requestChange((e.target.checked) ? 'true' : 'false');
  //     }
  //
  //     // elem props
  //     var elemProps = (
  //       <div className="elementProps">
  //         <Input type="text" label="Name" defaultValue={this.state.elem['@name']} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, nameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
  //         <Input ref="conceptRegInput" type="text" label="ConceptLink" value={(this.state.elem['@ConceptLink']) ? this.state.elem['@ConceptLink'] : ""} buttonAfter={this.props.viewer.conceptRegistryBtn(this)} labelClassName="col-xs-1" wrapperClassName="col-xs-3" onChange={this.updateConceptLink.bind(this, conceptLinkLink)} readOnly />
  //         <Input type="text" label="Documentation" defaultValue={this.state.elem['@Documentation']} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, docuLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
  //         <Input type="number" label="DisplayPriority" min={0} max={10} step={1} defaultValue={(this.state.elem.hasOwnProperty('@DisplayPriority')) ? this.state.elem['@DisplayPriority'] : 0} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, displayPriorityLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
  //         {valueScheme}
  //         <Input type="checkbox" label="Multilingual" defaultChecked={(this.state.elem.hasOwnProperty('@Multilingual')) ? this.state.elem['@Multilingual'] == "true" : false} onChange={handleMultiChange} wrapperClassName="col-xs-2 col-xs-offset-1" />
  //       </div>
  //     );
  //
  //     if(this.state.elem.open) {
  //       var addAttrLink = (this.state.editMode) ? <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute}>+Attribute</a></div> : null;
  //       var integerOpts = $.map($(Array(10)), function(item, index) {
  //         return <option key={index} value={index}>{index}</option>
  //       });
  //       var maxOccSelect = (this.state.elem.hasOwnProperty('@Multilingual') && this.state.elem['@Multilingual'] == "true" && maxC == "unbounded") ?
  //       (<Input type="select" label="Max Occurrences" value={maxC} disabled={true} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMaxChange}><option value="unbounded">unbounded</option>
  //       {integerOpts}</Input>) :
  //       (<Input type="select" label="Max Occurrences" defaultValue={maxC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMaxChange}><option value="unbounded">unbounded</option>
  //       {integerOpts}</Input>);
  //
  //       return (
  //         <div className={elementClasses}>
  //            {actionButtons}
  //           <span>Element: <a className="elementLink" onClick={this.toggleElement}>{elemName}</a></span> {cardOpt}
  //           <form className="form-horizontal form-group">
  //             {elemProps}
  //             <Input type="select" label="Min Occurrences" defaultValue={minC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMinChange}>
  //               <option value="unbounded">unbounded</option>
  //               {$.map($(Array(10)), function(item, index) {
  //                 return <option key={index} value={index}>{index}</option>
  //               })}
  //             </Input>
  //             {maxOccSelect}
  //           </form>
  //           {attrList}
  //           {addAttrLink}
  //         </div>
  //       );
  //     } else {
  //       var displayPr = (elem['@DisplayPriority']) ? " Display priority: " + elem['@DisplayPriority'] : "";
  //       var valSch = (typeof valueScheme == "string") ? valueScheme : "";
  //
  //       return (
  //         <div className={elementClasses}>
  //           {actionButtons}
  //           <span>Element: </span><a onClick={this.toggleElement} className="elementLink">{elemName}</a> Type: {valSch} {cardOpt} {displayPr}
  //         </div>
  //       );
  //     }
  //   } else {
  //     return (
  //       <div className="CMDElement">
  //         <span>Element: </span>
  //         <b>{elem['@name']}</b> { valueScheme }
  //         <div className="elemAttrs">
  //           { React.addons.createFragment({ left: this.elemAttrs(elem) }) }
  //         </div>
  //         {attrList}
  //       </div>
  //       );
  //   }
  // }
});

module.exports = CMDElementForm;
