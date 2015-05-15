'use strict';

var React = require('react/addons');

var LinkedStateMixin = require('../mixins/LinkedStateMixin');
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ActionButtonsMixin = require('../mixins/ActionButtonsMixin');

var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

var update = React.addons.update;

//require('../../styles/CMDAttribute.sass');

var CMDAttribute = React.createClass({
  mixins: [ImmutableRenderMixin, LinkedStateMixin, ActionButtonsMixin],
  getInitialState: function() {
    return { attr: this.props.attr,
             editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
  },
  componentDidMount: function() {
    var attr = this.state.attr;
    if(attr.ValueScheme != undefined)
      var enumVal = attr.ValueScheme.enumeration;
      if(enumVal != undefined && enumVal.item != undefined && !$.isArray(enumVal.item))
        enumVal.item = [enumVal.item];
  },
  componentDidUpdate: function(prevProps, prevState) {
    console.log('attr prev state: ' + JSON.stringify(prevState.attr));
    console.log('attr curr state: ' + JSON.stringify(this.state.attr));
    if(JSON.stringify(prevState.attr) != JSON.stringify(this.state.attr)) // TODO required with ImmutableRenderMixin?
      if(this.props.onUpdate)
        this.props.onUpdate(this.state.attr);
  },
  updateName: function(e) {
    this.linkState('attr.Name').requestChange(e.target.value);
  },
  updateConceptLink: function(newValue) {
    if(typeof newValue === "string")
      this.setState({ attr: update(this.state.attr, { ConceptLink: { $set: newValue } }) });
  },
  render: function () {
    var attr = this.state.attr;
    var attr_val = this.props.value(this);
    var conceptRegistryBtn = this.props.conceptRegistryBtn(this);
    var actionButtons = this.getActionButtons(false);

    if(this.state.editMode)
      return (
        <div className="attrAttr attrForm">
          {actionButtons}
          <form name="attrForm" className="form-horizontal form-group">
            <Input type="text" label="Name" defaultValue={attr.Name} onChange={this.updateName} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            <Input ref="conceptRegInput" type="text" label="ConceptLink" value={(attr.ConceptLink) ? attr.ConceptLink : ""} labelClassName="col-xs-1" wrapperClassName="col-xs-3" buttonAfter={conceptRegistryBtn} onChange={this.updateConceptLink} />
            {attr_val}
          </form>
        </div>
      );
    else
      return (
        <div className="attrAttr">
          {attr.Name} {attr_val}
        </div>
      );
  }
});

module.exports = CMDAttribute;
