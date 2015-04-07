'use strict';

var React = require('react/addons');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

//require('../../styles/CMDAttribute.sass');

var CMDAttribute = React.createClass({
  /* propTypes */
  setDefaultProps: {
    conceptRegistryBtn: null
  },
  getInitialState: function() {
    return { editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
  },
  componentDidMount: function() {
    var attr = this.props.attr;
    
    if(attr.ValueScheme != undefined)
      var enumVal = attr.ValueScheme.enumeration;
      if(enumVal != undefined && enumVal.item != undefined && !$.isArray(enumVal.item))
        enumVal.item = [enumVal.item];

  },
  render: function () {
    var attr = this.props.attr;
    var attr_val = this.props.getValue(attr);

    if(this.state.editMode)
      return (
        <div className="attrAttr attrForm">
          <form name="attrForm" className="form-horizontal form-group">
          <Input type="text" label="Name" defaultValue={attr.Name} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
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
