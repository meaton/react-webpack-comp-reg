'use strict';

var React = require('react/addons');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Input = require('react-bootstrap/lib/Input');

//components
var CMDAttributeView = require('./CMDAttributeView');
var ValueScheme = require('../ValueScheme');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../../styles/CMDElement.sass');

/**
* CMDElement - view display and editing form for a CMDI Element item.
* @constructor
* @mixes ImmutableRenderMixin
*/
var CMDElementView = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    open: React.PropTypes.bool,
    openAll: React.PropTypes.bool,
    closeAll: React.PropTypes.bool,
    expansionState: React.PropTypes.object
  },
  getDefaultProps: function() {
    return {
      open: true,
      openAll: false,
      closeAll: false
    };
  },
  render: function () {
    var self = this;
    var attrList = null;

    var elem = this.props.spec;
    var elemInspect = elem.elemId; // require('util').inspect(elem);

    var valueScheme = <ValueScheme obj={elem} enabled={false} />

    if(elem.AttributeList != undefined) {
      var attrSet = $.isArray(elem.AttributeList.Attribute) ? elem.AttributeList.Attribute : [elem.AttributeList.Attribute];
    }
    if(elem.AttributeList != undefined) {
      attrList = (
        <div className="attrList">AttributeList:
          {
            (attrSet != undefined && attrSet.length > 0) ?
            $.map(attrSet, function(attr, index) {
              return <CMDAttributeView key={attr._appId} spec={attr} />
            }) : <span>No Attributes</span>
          }
        </div>);
    }

    var multilingual = (elem.hasOwnProperty('@Multilingual')) && elem['@Multilingual'] == "true";
    var lb = React.createElement('br');
    var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : 1;
    var maxC = multilingual ? "unbounded" : ((elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : 1);

    return (
      <div className="CMDElement">
        <span>Element: </span>
        <span className="elementName">{elem['@name']}</span> { valueScheme }
        <ul className="elemAttrs">
          {(elem.hasOwnProperty("@ConceptLink") && elem["@ConceptLink"] !== "") && (
            <li className="attrElem">ConceptLink: <a href={elem["@ConceptLink"]} target="_blank">{elem['@ConceptLink']}</a></li>
          )}

          {elem.hasOwnProperty("@Documentation") && (
            <li className="attrElem">Documentation: {elem['@Documentation']}</li>
          )}

          {elem.hasOwnProperty("@DisplayPriority") && (
            <li className="attrElem">DisplayPriority: {elem['@DisplayPriority']}</li>
          )}

          <li className="attrElem">Number of occurrences: {minC} - {maxC}</li>
          <li className="attrElem">Multilingual: {multilingual ? "yes" : "no"}</li>
        </ul>
        {attrList}
      </div>
      );
  }
});

module.exports = CMDElementView;
