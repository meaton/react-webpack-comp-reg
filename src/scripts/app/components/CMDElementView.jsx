'use strict';

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDAttributeView = require('./CMDAttributeView');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/CMDElement.sass');

/**
* CMDElement - view display and editing form for a CMDI Element item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes LinkedStateMixin
*/
var CMDElementView = React.createClass({
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
  toggleElement: function(evt) {
    //TODO flux: action
    // console.log('toggle elem: ' + JSON.stringify(this.state.elem));
    // var isOpen = (this.state.elem.hasOwnProperty('open')) ? !this.state.elem.open : true;
    // this.setState({ elem: update(this.state.elem, { open: { $set: isOpen }}) });
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
    var attrList = null;

    var elem = this.props.spec;
    var elemInspect = elem.elemId; // require('util').inspect(elem);
    console.log('rendering element: ',  elemInspect);

    var valueScheme = "{valueScheme}";//TODO flux: this.props.viewer.getValueScheme(elem, this);

    if(elem.AttributeList != undefined) {
      var attrSet = $.isArray(elem.AttributeList.Attribute) ? elem.AttributeList.Attribute : [elem.AttributeList.Attribute];
    }
    if(elem.AttributeList != undefined) {
      attrList = (
        <div className="attrList">AttributeList:
          {
            (attrSet != undefined && attrSet.length > 0) ?
            $.map(attrSet, function(attr, index) {
              var attrId = (attr.attrId != undefined) ? attr.attrId : "attr_elem_" + md5.hash("attr_elem_" + index + "_" + Math.floor(Math.random()*1000));
              attr.attrId = attrId;
              return <CMDAttributeView key={attrId} spec={attr} />
            }) : <span>No Attributes</span>
          }
        </div>);
    }

    return (
      <div className="CMDElement">
        <span>Element: </span>
        <b>{elem['@name']}</b> { valueScheme }
        <div className="elemAttrs">
          { React.addons.createFragment({ left: this.elemAttrs(elem) }) }
        </div>
        {attrList}
      </div>
      );
  }
});

module.exports = CMDElementView;
