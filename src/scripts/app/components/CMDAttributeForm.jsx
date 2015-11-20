'use strict';
var log = require('loglevel');

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ConceptLinkDialogueMixin = require('../mixins/ConceptLinkDialogueMixin');
var SpecFormUpdateMixin = require('../mixins/SpecFormUpdateMixin');
var ActionButtonsMixin = require('../mixins/ActionButtonsMixin');
var ToggleExpansionMixin = require('../mixins/ToggleExpansionMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

//components
var ValueScheme = require('./ValueScheme');

//utils
var classNames = require('classnames');

require('../../../styles/CMDAttribute.sass');

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
            ConceptLinkDialogueMixin,
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

  /* Functions that handle changes in this component */


  propagateValue: function(field, value) {
    this.props.onAttributeChange({$merge: {[field]: value}});
  },

  updateAttributeValue: function(e) {
    this.propagateValue(e.target.name, e.target.value);
  },

  handleUpdateValueScheme: function(type, valScheme) {
    this.props.onAttributeChange({$merge: {
       Type: type,
       ValueScheme: valScheme
     }});
  },

  render: function () {
    var attr = this.props.spec;
    var attrClasses = classNames('CMDAttribute', { 'edit-mode': true, 'open': true });
    var attrName = (attr.Name == "") ? "[New Attribute]" : attr.Name;

    var open = this.isOpen();
    log.trace("Attribute", this.props.spec._appId, " open state:", open);

    var editableProps = open?(
      <div className="form-horizontal form-group">
        <Input type="text" label="Name" name="Name" value={attr.Name} onChange={this.updateAttributeValue} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
        <Input ref="conceptRegInput" name="ConceptLink" type="text" label="ConceptLink" value={(attr['ConceptLink']) ? attr['ConceptLink'] : ""}  onChange={this.updateAttributeValue}
          labelClassName="editorFormLabel" wrapperClassName="editorFormField" readOnly
          buttonAfter={this.newConceptLinkDialogueButton(this.propagateValue.bind(this, "ConceptLink"))} />
        <ValueScheme obj={attr} enabled={true} onChange={this.updateValueScheme.bind(this, this.handleUpdateValueScheme)} />
      </div>
    ) : null;

    return (
      <div className={attrClasses}>
        {this.createActionButtons() /* from ActionButtonsMixin */}
        <span>Attribute: <a className="attributeLink" onClick={this.toggleExpansionState}>{attrName}</a></span>
        {editableProps}
      </div>
    );
    return (
      <div className="attrAttr">
        {attr.Name} {attr_val}
      </div>
    );
  }
});

module.exports = CMDAttributeForm;
