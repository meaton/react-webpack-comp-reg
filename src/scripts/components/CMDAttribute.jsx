'use strict';

var React = require('react/addons');
var LinkedStateMixin = require('../mixins/LinkedStateMixin');
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var ActionButtonsMixin = require('../mixins/ActionButtonsMixin');

var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

//require('../../styles/CMDAttribute.sass');

var CMDAttribute = React.createClass({
  mixins: [ImmutableRenderMixin, LinkedStateMixin, ActionButtonsMixin],
  /* propTypes */
  setDefaultProps: {
    conceptRegistryBtn: null
  },
  getInitialState: function() {
    return { attr: this.props.attr, editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
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

    if(JSON.stringify(prevState.attr) != JSON.stringify(this.state.attr))
      if(this.props.onUpdate)
        this.props.onUpdate(this.state.attr);
  },
  updateHandler: function(e) {
    this.linkState('attr.Name').requestChange(e.target.value);
  },
  render: function () {
    var attr = this.state.attr;
    var attr_val = this.props.getValue(attr);
    var actionButtons = this.getActionButtons(false);

    if(this.state.editMode)
      return (
        <div className="attrAttr attrForm">
          {actionButtons}
          <form name="attrForm" className="form-horizontal form-group">
            <Input type="text" label="Name" defaultValue={attr.Name} onChange={this.updateHandler} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            {attr_val}
            <Input type="text" label="ConceptLink" value={(attr.ConceptLink != undefined) ? attr.ConceptLink : ""} labelClassName="col-xs-1" wrapperClassName="col-xs-3" buttonAfter={this.props.conceptRegistryBtn} />
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
