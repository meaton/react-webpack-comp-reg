'use strict';
var log = require('loglevel');

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//components
var ModalTrigger = require('./ModalTrigger');
var TypeModal = require('./TypeModal');

//boostrap
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

//utils
var ReactAlert = require('../util/ReactAlert');
var classnames = require('classnames');

/**
* ValueScheme selection component
*/
var ValueScheme = React.createClass({

  propTypes: {
    obj: React.PropTypes.object.isRequired,
    loadValueSchemeData: React.PropTypes.func,
    enabled: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },

  contextTypes: {
	    flux: React.PropTypes.object /* to pass to TypeModal (because modal is rendered outside tree, see below) */
	},

  getDefaultProps: function() {
    return {
      enabled: false
    };
  },

  render: function() {
      var obj = this.props.obj;
      var enabled = this.props.enabled;

      var valueScheme = obj['@ValueScheme']; // "simple" type, e.g. 'string'

      var valueSchemeElem = obj['ValueScheme']; // contains 'pattern' or 'enumeration'
      var vocabulary = (valueSchemeElem != null) ? valueSchemeElem.Vocabulary : null;
      var pattern = (valueSchemeElem != null) ? valueSchemeElem.pattern : null;
      var enumeration = (vocabulary != null) ? vocabulary.enumeration : null;

      var typeTrigger = (
        <ModalTrigger
          ref="modalTrigger"
          modalTarget="typeModalContainer"
          label="Edit..."
          onOpen={this.props.loadValueSchemeData}
          modal={
            <TypeModal
              onClose={this.closeDialogue}
              onChange={this.props.onChange}
              flux={this.context.flux /* need to pass flux because modal is rendered outside tree - details at http://stackoverflow.com/a/30372606 */}
              />
          } />
      );

      if(typeof valueScheme != "string") {
        valueScheme = valueSchemeElem;

        if(valueScheme == null) {
          valueScheme = "Undefined";
        } else {
          if(pattern != null) {
            valueScheme = pattern;
          } else if(vocabulary != null) {
            if(enumeration == null) {
              //TODO: Open vocabularies do not have an enumeration
            } else {
              var enumItems = (!$.isArray(enumeration.item)) ? [enumeration.item] : enumeration.item;
              var items = $.map(enumItems, function(item, index) {
                return (
                  <option key={obj._appId + index} disabled={!enabled} value={index}>
                    {(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}
                  </option>
                );
              });
              if(enabled) {
                return (
                  <Input ref="typeInput" type="select" label="Type" buttonAfter={typeTrigger} labelClassName="editorFormLabel" wrapperClassName="editorFormField vocabulary" defaultValue={0}>
                    {items}
                  </Input>
                );
              } else {
                return (
                  <Input ref="typeInput" type="select" defaultValue={0}>
                    {items}
                  </Input>
                );
              }
            }
          }
        }
      }

      var inputClasses = classnames("editorFormField",
        {
            pattern: (pattern != null),
            simpletype: (pattern == null)
        }
      );

      return (!this.props.enabled) ? <span className="attribute_scheme">{valueScheme}</span> :
        <Input ref="typeInput" type="text" label="Type"
          labelClassName="editorFormLabel" wrapperClassName={inputClasses}
          value={valueScheme} buttonAfter={typeTrigger}
          readOnly />;
    },

    closeDialogue: function(evt) {
      this.refs.modalTrigger.toggleModal(evt);
    }
});

module.exports = ValueScheme;
