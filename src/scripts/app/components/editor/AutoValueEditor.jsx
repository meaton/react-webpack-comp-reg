'use strict';

var log = require('loglevel');
var React = require('react');

//components
var ValidatingTextInput = require('./ValidatingTextInput');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var update = require('react-addons-update');

/**
 * AutoValueEditor
 * @type {[type]}
 */
var AutoValueEditor = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    autoValue: React.PropTypes.array,
    onChange: React.PropTypes.func.isRequired,
    validate: React.PropTypes.func.isRequired,
  },

  addAutoValueExpression: function() {
    if($.isArray(this.props.autoValue)) {
      this.props.onChange(update(this.props.autoValue, {$push: [""]}));
    } else {
      this.props.onChange([""]);
    }
  },

  updateAutoValueExpression: function(index, evt) {
    log.debug("Update auto value expression", index, evt);
    var newValue = evt.target.value;
    this.props.onChange(update(this.props.autoValue, {$splice: [[index, 1, newValue]]}));
  },

  removeAutoValueExpression: function(index) {
    log.debug("Remove auto value expression", index);
    this.props.onChange(update(this.props.autoValue, {$splice: [[index, 1]]}));
  },

  render: function () {
    return (
      <div className="auto-value">
          <label className="control-label editorFormLabel">Automatic value expressions</label>
          <div className="form-groups">
            {$.isArray(this.props.autoValue) &&
              this.props.autoValue.map(function(value, idx) {
                return (
                  <ValidatingTextInput key={idx} name="AutoValue" type="text" value={value}
                  wrapperClassName="editorFormField" onChange={this.updateAutoValueExpression.bind(this, idx)} validate={this.props.validate}
                  addonAfter={<a className="delete" onClick={this.removeAutoValueExpression.bind(this, idx)}><Glyphicon glyph="trash"/></a>}
                  />
                );
              }.bind(this))
            }
            <div><a onClick={this.addAutoValueExpression}><Glyphicon glyph="plus" />Add automatic value expression</a></div>
          </div>
      </div>
    );
  }
});

module.exports = AutoValueEditor;
