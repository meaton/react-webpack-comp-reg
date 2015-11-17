'use strict';

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ConceptLinkDialogueMixin = require('../mixins/ConceptLinkDialogueMixin');
var SpecFormUpdateMixin = require('../mixins/SpecFormUpdateMixin');

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
  mixins: [ImmutableRenderMixin, ConceptLinkDialogueMixin, SpecFormUpdateMixin],
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
  render: function () {
    var attrClasses = classNames('CMDAttribute', { 'edit-mode': true, 'open': true });

    var attr = this.props.spec;
    var actionButtons = null;//TODO: this.getActionButtons(false);
    return (
      <div className={attrClasses}>
        {actionButtons}
        <form name="attrForm" className="form-horizontal form-group">
          <Input type="text" label="Name" defaultValue={attr.Name} onChange={this.updateName} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
          <Input ref="conceptRegInput" name="@ConceptLink" type="text" label="ConceptLink" value={(attr['@ConceptLink']) ? attr['@ConceptLink'] : ""}  onChange={this.updateAttributeValue}
            labelClassName="editorFormLabel" wrapperClassName="editorFormField" readOnly
            buttonAfter={this.newConceptLinkDialogueButton(this.updateConceptLink)} />
          <ValueScheme obj={attr} enabled={true} onChange={this.updateValueScheme} />
        </form>
      </div>
    );
    return (
      <div className="attrAttr">
        {attr.Name} {attr_val}
      </div>
    );
  },

  propagateValue: function(field, value) {
    //TODO
    //this.props.onElementChange({$merge: {[field]: value}});
  },

  updateElementValue: function(e) {
    //TODO
    //this.propagateValue(e.target.name, e.target.value);
  },

  //below: old functions
  // getInitialState: function() {
  //   return { attr: this.props.attr,
  //            editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
  // },
  // componentDidMount: function() {
  //   var attr = this.state.attr;
  //   if(attr.ValueScheme != undefined) {
  //     var enumVal = attr.ValueScheme.enumeration;
  //     if(enumVal != undefined && enumVal.item != undefined && !$.isArray(enumVal.item)) {
  //       attr = update(attr, { ValueScheme: { enumeration: { item: { $set: [enumVal.item] } }}});
  //       this.setState({ attr: attr });
  //     }
  //   }
  // },
  // componentWillUpdate: function(nextProps, nextState) {
  //   console.log(this.constructor.displayName, 'will update: ', nextState.attr.attrId);
  // },
  // componentDidUpdate: function(prevProps, prevState) {
  //   console.log(this.constructor.displayName, 'did update: ', this.state.attr.attrId);
  //   //console.log('attr prev state: ' + JSON.stringify(prevState.attr));
  //   //console.log('attr curr state: ' + JSON.stringify(this.state.attr));
  //
  //   if(JSON.stringify(this.state.attr) != JSON.stringify(prevState.attr))
  //     this.props.onUpdate(this.state.attr);
  // },
  // updateName: function(e) {
  //   this.setState({ attr: update(this.state.attr, { Name: { $set: e.target.value } }) });
  // },
  // updateConceptLink: function(newValue, evt) {
  //   if(typeof newValue === "string")
  //     this.setState({ attr: update(this.state.attr, { ConceptLink: { $set: newValue } }) });
  // },
  // render: function () {
  //   var attr = this.state.attr;
  //   var attr_val = this.props.value(this);
  //   var conceptRegistryBtn = this.props.conceptRegistryBtn(this);
  //   var actionButtons = this.getActionButtons(false);
  //   if(this.state.editMode)
  //     return (
  //       <div className="attrAttr attrForm">
  //         {actionButtons}
  //         <form name="attrForm" className="form-horizontal form-group">
  //           <Input type="text" label="Name" defaultValue={attr.Name} onChange={this.updateName} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
  //           <Input ref="conceptRegInput" type="text" label="ConceptLink" value={attr.ConceptLink} labelClassName="col-xs-1" wrapperClassName="col-xs-3" buttonAfter={conceptRegistryBtn} onChange={this.updateConceptLink} readOnly />
  //           {attr_val}
  //         </form>
  //       </div>
  //     );
  //   else
  //     return (
  //       <div className="attrAttr">
  //         {attr.Name} {attr_val}
  //       </div>
  //     );
  // }
});

module.exports = CMDAttributeForm;
