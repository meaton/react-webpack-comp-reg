'use strict';

var React = require('react/addons');

//mixins
//var LinkedStateMixin = require('../../mixins/LinkedStateMixin');
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

      var typeTrigger = (
        <ModalTrigger
          ref="modalTrigger"
          container={this}
          label="Edit..."
          modal={
            <TypeModal
              onClose={this.closeDialogue}
              onChange={this.props.onChange}
              container={this} />
          } />
      );

      var obj=this.props.obj;
      var valueScheme = obj['@ValueScheme'];

      if(typeof valueScheme != "string") {
        valueScheme = obj.ValueScheme;

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
              <DropdownButton bsSize="small" title={(enumItems.length > 0 && typeof enumItems[0] != "string") ? enumItems[0]['$'] : enumItems[0]}>
                {
                  $.map(enumItems, function(item, index) {
                    return (<MenuItem key={obj._appId + index} eventKey={index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</MenuItem>);
                  })
                }
              </DropdownButton>
            );
          }

        } else if(obj.Type != undefined) // attr
            valueScheme = obj.Type;
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
