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
    var conceptLink_attr = (elem.hasOwnProperty("@ConceptLink")) ? [React.createElement("span", { className: "attrElem" }, elem['@ConceptLink']), lb] : null;
    var multilingual_attr = (elem.hasOwnProperty('@Multilingual')) ? [React.createElement("span", { className: "attrElem" }, "Multilingual: " + elem['@Multilingual']), lb]: "Multilingual: false";
    var card_attr = [React.createElement('span', { className: "attrElem" }, "Number of occurrences: " + minC + " - " + maxC), lb];
    return {conceptLink_attr, card_attr, multilingual_attr};
  },
  render: function () {
    //TODO: Use ValueScheme and display enums
    var valueScheme = this.props.elem['@ValueScheme'];
    console.log('rendering element: ' + require('util').inspect(this.props.elem));
    console.log(typeof valueScheme);
    if(typeof valueScheme != "string") {
      valueScheme = this.props.elem.ValueScheme;
      if(valueScheme != undefined)
        valueScheme = (
          <DropdownButton bsSize="small" title={(valueScheme.enumeration.item.length > 0 && typeof valueScheme.enumeration.item[0] != "string") ? valueScheme.enumeration.item[0]['$'] : valueScheme.enumeration.item[0]}>
            {
              $.map(valueScheme.enumeration.item, function(item, index) {
                return <MenuItem eventKey={index}>{(typeof item != "string" && item.hasOwnProperty('$')) ? item['$'] : item}</MenuItem>
              })
            }
          </DropdownButton>
        );
    }
    return (
      <div className="CMDElement">
        <span>Element: </span>{this.props.elem['@name']} { valueScheme }
        <div className="elemAttrs">
          {this.elemAttrs(this.props.elem)}
        </div>
      </div>
      );
  }
});

module.exports = CMDElement;
