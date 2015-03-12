'use strict';

var React = require('react');

//require('../../styles/CMDElement.sass');

var CMDElement = React.createClass({
  elemAttrs: function(elem) {
    var lb = React.createElement('br');
    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : 1;
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : 1;
    var conceptLink_attr = (elem.hasOwnProperty("@ConceptLink")) ? [React.createElement("span", { className: "attrElem" }, elem['@ConceptLink']), lb] : null;
    var multilingual_attr = (elem.hasOwnProperty('@Multilingual')) ? [React.createElement("span", { className: "attrElem" }, "Multilingual: " + elem['@Multilingual']), lb]: null;
    var card_attr = [React.createElement('span', { className: "attrElem" }, "Number of occurrences: " + minC + " - " + maxC), lb];
    return {conceptLink_attr, card_attr, multilingual_attr};
  },
  render: function () {
    return (
      <div className="CMDElement">
        <span>Element: </span>{this.props.elem['@name']} {this.props.elem['@ValueScheme']}
        <div className="elemAttrs">
          {this.elemAttrs(this.props.elem)}
        </div>
      </div>
      );
  }
});

module.exports = CMDElement;
