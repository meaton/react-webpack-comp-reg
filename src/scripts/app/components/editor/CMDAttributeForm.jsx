'use strict';
var log = require('loglevel');

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var SpecFormUpdateMixin = require('../../mixins/SpecFormUpdateMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');
var ToggleExpansionMixin = require('../../mixins/ToggleExpansionMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

//components
var ValueScheme = require('../ValueScheme');
var ValidatingTextInput = require('./ValidatingTextInput');
var ConceptLinkInput = require('./ConceptLinkInput');

//utils
var classNames = require('classnames');
var changeObj = require('../../util/ImmutabilityUtil').changeObj;
var Validation = require('../../service/Validation');

require('../../../../styles/CMDAttribute.sass');

/**
* CMDAttribute - view display and editing form for a CMDI Attribute item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDAttributeForm = React.createClass({

  mixins: [ImmutableRenderMixin,
            ToggleExpansionMixin,
            SpecFormUpdateMixin,
            ActionButtonsMixin],

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    key: React.PropTypes.string,
    onAttributeChange: React.PropTypes.func.isRequired
    /* more props defined in ToggleExpansionMixin and ActionButtonsMixin */
  },

  /**
   * Attributes should always be open by default
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return true;
  },

  render: function () {
    var attr = this.props.spec;
    var attrClasses = classNames('CMDAttribute', { 'edit-mode': true, 'open': true });
    var attrName = (attr['@name'] == "") ? "[New Attribute]" : attr['@name'];

    var open = this.isOpen();
    log.trace("Attribute", this.props.spec._appId, " open state:", open);

    var editableProps = open?(
      <div className="form-horizontal form-group">
        <ValidatingTextInput type="text" label="Name" name="Name" value={attr['@name']} wrapperClassName="editorFormField"
          onChange={this.updateAttributeValue} validate={this.validate} />
        <ConceptLinkInput name="ConceptLink" type="text" label="ConceptLink" value={(attr['@ConceptLink']) ? attr['@ConceptLink'] : ""}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField"
          onChange={this.updateAttributeValue} validate={this.validate}
          updateConceptLink={this.propagateValue.bind(this, "ConceptLink")} />
        <ValueScheme obj={attr} enabled={true} onChange={this.updateValueScheme.bind(this, this.handleUpdateValueScheme)} />
      </div>
    ) : null;

    return (
      <div className={attrClasses}>
        <div className="panel panel-success">
          <div className="panel-heading">
            {this.createActionButtons({ /* from ActionButtonsMixin */
              title: <span>Attribute: <span className="attrName">{attrName}</span></span>
            })}
          </div>
          {open &&
            <div className="panel-body">
              {editableProps}
            </div>
          }
        </div>
      </div>
    );
  },

  /*=== Functions that handle changes in this component ====*/

  propagateValue: function(field, value) {
    this.props.onAttributeChange({$merge: changeObj(field ,value)});
  },

  updateAttributeValue: function(e) {
    this.propagateValue(e.target.name, e.target.value);
  },

  handleUpdateValueScheme: function(type, valScheme) {
    this.props.onAttributeChange({$merge: {
       '@ValueScheme': type,
       ValueScheme: valScheme
     }});
  },

  /*=== Validation of field values ====*/

  validate: function(val, targetName, feedback) {
    return Validation.validateField('attribute', targetName, val, feedback)
      && (targetName != 'Name' || this.props.checkUniqueName(targetName, val, feedback));
  }
});

module.exports = CMDAttributeForm;
