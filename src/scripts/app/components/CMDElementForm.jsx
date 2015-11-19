'use strict';
var log = require('loglevel');

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ConceptLinkDialogueMixin = require('../mixins/ConceptLinkDialogueMixin');
var SpecFormUpdateMixin = require('../mixins/SpecFormUpdateMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDAttributeForm = require('./CMDAttributeForm');
var ValueScheme = require('./ValueScheme');

//utils
var classNames = require('classnames');

require('../../../styles/CMDElement.sass');

/**
* CMDElementForm - editing form for a CMDI Element item
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDElementForm = React.createClass({
  mixins: [ImmutableRenderMixin, ConceptLinkDialogueMixin, SpecFormUpdateMixin],

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

  /* Functions that handle changes (in this component and its children) */

  propagateValue: function(field, value) {
    this.props.onElementChange({$merge: {[field]: value}});
  },

  updateElementValue: function(e) {
    this.propagateValue(e.target.name, e.target.value);
  },

  updateElementSelectValue: function(e) {
    var value = e.target.checked ? "true":"false";
    this.propagateValue(e.target.name, value);
  },

  toggleElement: function(evt) {
    //TODO flux: action
    // console.log('toggle elem: ' + JSON.stringify(this.state.elem));
    // var isOpen = (this.state.elem.hasOwnProperty('open')) ? !this.state.elem.open : true;
    // this.setState({ elem: update(this.state.elem, { open: { $set: isOpen }}) });
  },

  renderAttributes: function(elem) {
    var attrSet = (elem.AttributeList != undefined && $.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
    if(attrSet != undefined) {
      return (
        <div className="attrList">AttributeList:
          {
            (attrSet != undefined && attrSet.length > 0) ?
            $.map(attrSet, function(attr, index) {
              return <CMDAttributeForm
                        key={attr._appId}
                        spec={attr}
                        onAttributeChange={this.handleAttributeChange.bind(this, this.props.onElementChange, index)}
                        />
                    }.bind(this)) : <span>No Attributes</span>
          }
        </div>);
    } else {
      return null;
    }
  },

  render: function () {
    var self = this;
    var actionButtons = null;//TODO: this.getActionButtons();

    var elem = this.props.spec;
    var elemInspect = elem.elemId; // require('util').inspect(elem);

    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : "1";
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : "1";
    var cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );

    // classNames
    var elementClasses = classNames('CMDElement', { 'edit-mode': true, 'open': true });
    var elemName = (elem['@name'] == "") ? "[New Element]" : elem['@name'];

    // elem props
    var elemProps = (
      <div className="elementProps">
        <Input type="text" name="@name" label="Name" value={elem['@name']} onChange={this.updateElementValue} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
        <Input ref="conceptRegInput" name="@ConceptLink" type="text" label="ConceptLink" value={(elem['@ConceptLink']) ? elem['@ConceptLink'] : ""}  onChange={this.updateElementValue}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" readOnly
          buttonAfter={this.newConceptLinkDialogueButton(this.updateConceptLink)} />
        <Input type="text" name="@Documentation" label="Documentation" value={elem['@Documentation']} onChange={this.updateElementValue} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
        <Input type="number" name="@DisplayPriority" label="DisplayPriority" min={0} max={10} step={1} value={(elem.hasOwnProperty('@DisplayPriority')) ? elem['@DisplayPriority'] : 0} onChange={this.updateElementValue} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
        <ValueScheme obj={elem} enabled={true} onChange={this.updateValueScheme.bind(this, this.props.onElementChange)} />
        <Input type="checkbox" name="@Multilingual" label="Multilingual" checked={(elem.hasOwnProperty('@Multilingual')) ? elem['@Multilingual'] == "true" : false} onChange={this.updateElementSelectValue} wrapperClassName="editorFormField" />
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
          <Input type="select" name="@CardinalityMin" label="Min Occurrences" value={minC} labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.updateElementValue}>
            {integerOpts /*TODO: max @CardinalityMax*/}
          </Input>
          <Input type="select" name="@CardinalityMax" label="Max Occurrences" value={maxC} disabled={maxOccDisabled} labelClassName="editorFormLabel" wrapperClassName="editorFormField" onChange={this.updateElementValue}>
            {integerOpts /*TODO: min @CardinalityMin*/}
            <option value="unbounded">unbounded</option>
          </Input>
        </div>
        {this.renderAttributes(elem)}
        <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute.bind(this, this.props.onElementChange)}>+Attribute</a></div>
      </div>
    );
  },

















  //below: old functions
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
});

module.exports = CMDElementForm;
