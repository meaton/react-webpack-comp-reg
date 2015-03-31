'use strict';

var React = require('react');
var CMDAttribute = require('./CMDAttribute');

//require('../../styles/CMDElement.sass');

var CMDElement = React.createClass({
  getInitialState: function() {
    return { editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
  },
  elemAttrs: function(elem) {
    var lb = React.createElement('br');
    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : 1;
    var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : 1;
    var docu_attr = (elem.hasOwnProperty("@Documentation")) ? [React.createElement("span", { className: "attrElem" }, "Documentation: " + elem['@Documentation']), lb] : null;
    var display_attr = (elem.hasOwnProperty("@DisplayPriority")) ? [React.createElement("span", { className: "attrElem" }, "DisplayPriority: " + elem['@DisplayPriority']), lb] : null;
    var conceptLink_attr = (elem.hasOwnProperty("@ConceptLink")) ? [React.createElement("span", { className: "attrElem" }, "ConceptLink: ", new React.createElement("a", { href: elem['@ConceptLink'], target: "_blank" }, elem['@ConceptLink']) ), lb] : null;
    var multilingual_attr = (elem.hasOwnProperty('@Multilingual')) ? [React.createElement("span", { className: "attrElem" }, "Multilingual: " + elem['@Multilingual']), lb]: null;
    var card_attr = [React.createElement('span', { className: "attrElem" }, "Number of occurrences: " + minC + " - " + maxC), lb];
    return {conceptLink_attr, docu_attr, display_attr, card_attr, multilingual_attr};
  },
  render: function () {
    var self = this;
    var valueScheme = this.props.viewer.getValueScheme(this.props.elem);

    console.log('rendering element: ' + require('util').inspect(this.props.elem));
    if(this.state.editMode) {
      var displayPr = (this.props.elem['@DisplayPriority']) ? " Display priority: " + this.props.elem['@DisplayPriority'] : "";
      var cardMaxMin = " Cardinality: " + this.props.elem['@CardinalityMin'] + " - " + this.props.elem['@CardinalityMax'];
      var valSch = (typeof valueScheme == "string") ? valueScheme : "";
      return (
        <div>Element: {"Name: " + this.props.elem['@name'] + " Type: " + valSch + cardMaxMin + displayPr}</div>
      );
    }

    var attrList = null;
    if(this.props.elem.AttributeList != undefined) {
      var attrSet = ($.isArray(this.props.elem.AttributeList.Attribute)) ? this.props.elem.AttributeList.Attribute : this.props.elem.AttributeList;
      attrList = (
        <div className="attrList">AttributeList:
          {
            $.map(attrSet, function(attr) {
              return <CMDAttribute attr={attr} getValue={self.props.viewer.getValueScheme}/>;
            })
          }
        </div>
      );
    }

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
