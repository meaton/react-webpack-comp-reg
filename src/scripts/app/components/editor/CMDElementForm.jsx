'use strict';
var log = require('loglevel');

var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var SpecFormUpdateMixin = require('../../mixins/SpecFormUpdateMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');
var ToggleExpansionMixin = require('../../mixins/ToggleExpansionMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDAttributeForm = require('./CMDAttributeForm');
var CardinalityInput = require('./CardinalityInput');
var ValueScheme = require('../ValueScheme');
var ValidatingTextInput = require('./ValidatingTextInput');
var ConceptLinkInput = require('./ConceptLinkInput');

//utils
var classNames = require('classnames');
var Validation = require('../../service/Validation');
var changeObj = require('../../util/ImmutabilityUtil').changeObj;

require('../../../../styles/CMDElement.sass');

/**
* CMDElementForm - editing form for a CMDI Element item
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDElementForm = React.createClass({
  mixins: [ImmutableRenderMixin,
            ToggleExpansionMixin,
            SpecFormUpdateMixin,
            ActionButtonsMixin],

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    key: React.PropTypes.string,
    onElementChange: React.PropTypes.func.isRequired,
    checkDisplayPriorities: React.PropTypes.func.isRequired
    /* more props defined in ToggleExpansionMixin and ActionButtonsMixin */
  },

  /**
   * Elements should always be open by default
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return true;
  },

  /*=== Render functions ===*/

  render: function () {
    var self = this;
    var open = this.isOpen();

    log.trace("Element", this.props.spec._appId, " open state:", open);

    var elem = this.props.spec;
    var elemInspect = elem.elemId;

    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : "1";
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : "1";
    var cardOpt = !open && ( <span>&nbsp;[{minC + " - " + maxC}]</span> );
    var type = !open && (<ValueScheme obj={elem} enabled={false} />)
    // classNames
    var elementClasses = classNames('CMDElement', { 'edit-mode': true, 'open': true });
    var elemName = (elem['@name'] == "") ? "[New Element]" : elem['@name'];

    var multilingual = (elem.hasOwnProperty('@Multilingual') && elem['@Multilingual'] == "true");//TODO && maxC == "unbounded");

    //putting it all together...
    return (
      <div className={elementClasses}>
        <div className='panel panel-warning'>
          <div className="panel-heading">
            {this.createActionButtons({ /* from ActionButtonsMixin */
              title: <span>Element: <span className="elementName">{elemName}</span> {type} {cardOpt}</span>
            })}
          </div>
          {open && (
            <div className="panel-body">
              <div className="form-horizontal form-group">
                <ValidatingTextInput type="text" name="@name" label="Name" value={elem['@name']}
                  labelClassName="editorFormLabel" wrapperClassName="editorFormField"
                  onChange={this.updateElementValue} validate={this.validate} />
                <ConceptLinkInput name="@ConceptLink" type="text" label="ConceptLink" value={(elem['@ConceptLink']) ? elem['@ConceptLink'] : ""}
                  labelClassName="editorFormLabel" wrapperClassName="editorFormField"
                  onChange={this.updateElementValueWithDefault.bind(this, "")} validate={this.validate}
                  updateConceptLink={this.updateConceptLink} />
                <Input type="text" name="@Documentation" label="Documentation" value={elem['@Documentation']} onChange={this.updateElementValueWithDefault.bind(this, "")} labelClassName="editorFormLabel" wrapperClassName="editorFormField" />
                <ValidatingTextInput type="number" name="@DisplayPriority" label="DisplayPriority"
                  value={(elem['@DisplayPriority'] != null) ? elem['@DisplayPriority'] : 0}
                  labelClassName="editorFormLabel" wrapperClassName="editorFormField"
                  onChange={this.updateElementValueWithDefault.bind(this, "0")} validate={this.validate}
                  min={0} max={10} step={1}
                  />
                <ValueScheme obj={elem} enabled={true} onChange={this.updateValueScheme.bind(this, this.handleUpdateValueScheme)} />
                {(elem['@ValueScheme'] == "string" || elem['@Multilingual'] == "true") && //hide multilingual for non-string elements (or if it happens to have been set to true)
                  <Input type="checkbox" name="@Multilingual" label="Multilingual" checked={multilingual} onChange={this.updateElementSelectValue.bind(this, "false")} wrapperClassName="editorFormField" />
                }
                <CardinalityInput min={elem['@CardinalityMin']} max={multilingual ? "unbounded" : elem['@CardinalityMax']} onValueChange={this.updateElementValue} maxOccurrencesAllowed={!multilingual} />
              </div>
            </div>
          )}
        </div>
        {this.renderAttributes(elem)}
        {this.isOpen() &&
          <div className="addAttribute controlLinks"><a onClick={this.addNewAttribute.bind(this, this.props.onElementChange)}>+Attribute</a></div>
        }
      </div>
    );
  },

  renderAttributes: function(elem) {
    var attrSet = (elem.AttributeList != undefined && $.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
    return (
      <div className="attrList">
        <ReactCSSTransitionGroup transitionName="editor-items" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {
          (attrSet != undefined && attrSet.length > 0) &&
          $.map(attrSet, function(attr, index) {
            return <CMDAttributeForm
                      key={attr._appId}
                      spec={attr}
                      onAttributeChange={this.handleAttributeChange.bind(this, this.props.onElementChange, index)}
                      onMove={this.handleMoveAttribute.bind(this, this.props.onElementChange, index)}
                      onRemove={this.handleRemoveAttribute.bind(this, this.props.onElementChange, index)}
                      isFirst={index == 0}
                      isLast={index == this.props.spec.AttributeList.Attribute.length - 1}
                      checkUniqueName={Validation.checkUniqueSiblingName.bind(this, this.props.spec.AttributeList.Attribute)}
                      {... this.getExpansionProps() /* from ToggleExpansionMixin*/}
                      />
                  }.bind(this))
        }
        </ReactCSSTransitionGroup>
      </div>);
  },

  /*=== Functions that handle changes (in this component and its children) ===*/

  propagateValue: function(field, value) {
    this.props.onElementChange({$merge: changeObj(field, value)});
  },

  updateElementValue: function(e) {
    this.updateElementValueWithDefault(null, e);
  },

  updateElementValueWithDefault: function(defaultValue, e) {
    if(defaultValue !== null && e.target.value === defaultValue) {
      // value equals default, pass null
      this.propagateValue(e.target.name, null);
    } else {
      this.propagateValue(e.target.name, e.target.value);
    }
  },

  updateElementSelectValue: function(defaultValue, e) {
    var value = e.target.checked ? "true":"false";
    if(defaultValue !== null && value === defaultValue) {
      this.propagateValue(e.target.name, null);
    } else {
      this.propagateValue(e.target.name, value);
    }
  },

  handleUpdateValueScheme: function(type, valScheme) {
    var newProps = {
      '@ValueScheme': type,
      ValueScheme: valScheme
    };
    if(type !== "string") {
      // only 'string' type allows for multilingual elements
      newProps['@Multilingual'] = null;
    }
    this.props.onElementChange({$merge: newProps});
  },

  /*=== Validation of field values ====*/

  validate: function(val, targetName, feedback) {
    if(targetName == '@DisplayPriority') {
      if(!this.props.checkDisplayPriorities()) {
        feedback('At least one element must have non-zero display priority');
        return false;
      } else {
        return true;
      }
    } else {
      return Validation.validateField('element', targetName, val, feedback)
        && (targetName != '@name' || this.props.checkUniqueName(targetName, val, feedback));
    }
  }
});

module.exports = CMDElementForm;
