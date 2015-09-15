'use strict';

var React = require('react/addons');

//mixins
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

//require('../../styles/CMDAttribute.sass');

/**
* CMDAttribute - view display and editing form for a CMDI Attribute item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
* @mixes ActionButtonsMixin
*/
var CMDAttributeView = React.createClass({
  mixins: [ImmutableRenderMixin, LinkedStateMixin],
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
    var attr = this.props.spec;
    var attr_val = "{ValueScheme}"; //TODO flux
    return (
      <div className="attrAttr">
        {attr.Name} {attr_val}
      </div>
    );
  }
});

module.exports = CMDAttributeView;
