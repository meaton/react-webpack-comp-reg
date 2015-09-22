'use strict';

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');

//components
var ValueScheme = require('./ValueScheme');

//require('../../styles/CMDAttribute.sass');

/**
* CMDAttribute - view display and editing form for a CMDI Attribute item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes ActionButtonsMixin
*/
var CMDAttributeView = React.createClass({
  mixins: [ImmutableRenderMixin],
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
    var attr_val = <ValueScheme obj={attr} enabled={false} />
    return (
      <div className="attrAttr">
        {attr.Name} {attr_val}
      </div>
    );
  }
});

module.exports = CMDAttributeView;
