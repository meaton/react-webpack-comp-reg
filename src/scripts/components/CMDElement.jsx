'use strict';

var React = require('react');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

//require('../../styles/CMDElement.sass');

var CMDElement = React.createClass({
  elemAttrs: function(elem) {
    var lb = React.createElement('br');
    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : 1;
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : 1;
    var docu_attr = (elem.hasOwnProperty("@Documentation")) ? [React.createElement("span", { className: "attrElem" }, "Documentation: " + elem['@Documentation']), lb] : null;
    var display_attr = (elem.hasOwnProperty("@DisplayPriority")) ? [React.createElement("span", { className: "attrElem" }, "DisplayPriority: " + elem['@DisplayPriority']), lb] : null;
    var conceptLink_attr = (elem.hasOwnProperty("@ConceptLink")) ? [React.createElement("span", { className: "attrElem" }, "ConceptLink: ", new React.createElement("a", { href: elem['@ConceptLink'] }, elem['@ConceptLink']) ), lb] : null;
    var multilingual_attr = (elem.hasOwnProperty('@Multilingual')) ? [React.createElement("span", { className: "attrElem" }, "Multilingual: " + elem['@Multilingual']), lb]: null;
    var card_attr = [React.createElement('span', { className: "attrElem" }, "Number of occurrences: " + minC + " - " + maxC), lb];
    return {conceptLink_attr, docu_attr, display_attr, card_attr, multilingual_attr};
  },
  getValueScheme: function(obj) {
    var valueScheme = obj['@ValueScheme'];
    console.log(typeof valueScheme);

    if(typeof valueScheme != "string") {
      valueScheme = obj.ValueScheme;

      if(valueScheme != undefined) {
        if(valueScheme.pattern != undefined) // attr or elem
          valueScheme = valueScheme.pattern;
        else { // elem
          var enumItems = (!$.isArray(valueScheme.enumeration.item)) ? [valueScheme.enumeration.item] : valueScheme.enumeration.item;
          valueScheme = (
            <DropdownButton bsSize="small" title={(enumItems.length > 0 && typeof enumItems[0] != "string") ? enumItems[0]['$'] : enumItems[0]}>
              {
                $.map(enumItems, function(item, index) {
                  return <MenuItem eventKey={index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</MenuItem>
                })
              }
            </DropdownButton>
          );
        }
      } else if(obj.Type != undefined) // attr
          return obj.Type;
    }

    return valueScheme;
  },
  render: function () {
    var self = this;
    var valueScheme = this.getValueScheme(this.props.elem);
    console.log('rendering element: ' + require('util').inspect(this.props.elem));

    var attrList = (this.props.elem.AttributeList != undefined) ? (
      <div className="attrList">AttributeList:
        <div className="attrAttr">
        {
          $.map(this.props.elem.AttributeList, function(attr) {
            return attr.Name + " " + self.getValueScheme(attr);
          })
        }
        </div>
      </div>
    ) : null;

    return (
      <div className="CMDElement">
        <span>Element: </span>
        <b>{this.props.elem['@name']}</b> { valueScheme }
        <div className="elemAttrs">
          {this.elemAttrs(this.props.elem)}
        </div>
        {attrList}
      </div>
      );
  }
});

module.exports = CMDElement;
