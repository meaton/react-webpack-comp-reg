'use strict';
var log = require('loglevel');

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//components
var ModalTrigger = require('./ModalTrigger');
var TypeModal = require('./TypeModal');

//boostrap
var Input = require('react-bootstrap/lib/Input');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

/**
* ValueScheme selection component
*/
var ValueScheme = React.createClass({

  propTypes: {
    obj: React.PropTypes.object.isRequired,
    enabled: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      enabled: false
    };
  },

  render: function() {

      var obj=this.props.obj;
      var valueSchemeAttr = obj['@ValueScheme']; // element, e.g. 'string'
      var typeElem = obj.Type; //attribute, e.g. 'string'
      var valueSchemeElem = obj['ValueScheme']; // element or attribute, contains 'pattern' or 'enumeration'

      var type = (typeElem != undefined) ? typeElem : valueSchemeAttr;
      var enumeration = (valueSchemeElem != undefined) ? valueSchemeElem.enumeration : null;
      var pattern = (valueSchemeElem != undefined) ? valueSchemeElem.pattern : null;

      log.trace("TypeModal params", {type: type, enumeration: enumeration, pattern: pattern});

      var typeTrigger = (
        <ModalTrigger
          ref="modalTrigger"
          container={this}
          label="Edit..."
          modal={
            <TypeModal
              onClose={this.closeDialogue}
              onChange={this.props.onChange}
              container={this}
              type={type}
              enumeration={enumeration}
              pattern={pattern}
              />
          } />
      );

      var obj=this.props.obj;
      var valueScheme = valueSchemeAttr;

      if(typeof valueScheme != "string") {
        valueScheme = valueSchemeElem;

        if(valueScheme != undefined) {
          if(valueScheme.pattern != undefined) // attr or elem
            valueScheme = valueScheme.pattern;
          else { // elem
            var enumItems = (!$.isArray(valueScheme.enumeration.item)) ? [valueScheme.enumeration.item] : valueScheme.enumeration.item;
            return (this.props.enabled) ? (
              <Input ref="typeInput" type="select" label="Type" buttonAfter={typeTrigger} labelClassName="col-xs-1" wrapperClassName="col-xs-2">
                {$.map(enumItems, function(item, index) {
                  return (<option key={obj._appId + index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</option>);
                })}
              </Input>
            ) : (
              <DropdownButton id={"values_" + obj._appId} bsSize="small" title={(enumItems.length > 0 && typeof enumItems[0] != "string") ? enumItems[0]['$'] : enumItems[0]}>
                {
                  $.map(enumItems, function(item, index) {
                    return (<MenuItem key={obj._appId + index} eventKey={index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</MenuItem>);
                  })
                }
              </DropdownButton>
            );
          }

        } else if(obj.Type != undefined) // attr
            valueScheme = typeElem;
      }
      return (!this.props.enabled) ? <span className="attribute_scheme">{valueScheme}</span> :
        <Input ref="typeInput" type="text" label="Type"
          labelClassName="editorFormLabel" wrapperClassName="editorFormField"
          value={valueScheme} buttonAfter={typeTrigger}
          readOnly />;
    },

    closeDialogue: function(evt) {
      this.refs.modalTrigger.toggleModal(evt);
    }
});

module.exports = ValueScheme;
