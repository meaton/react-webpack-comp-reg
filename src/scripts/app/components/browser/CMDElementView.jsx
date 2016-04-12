'use strict';

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//components
var CMDAttributeView = require('./CMDAttributeView');
var ValueScheme = require('../ValueScheme');

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
        <div className="attrList">
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
        <div className="panel panel-warning">
          <div className="panel-heading">
            <span>Element: </span>
            <span className="elementName">{elem['@name']}</span>
          </div>
          <div className="panel-body">
            <div className="valueScheme"><span className="attrLabel">Value scheme:</span>{valueScheme}</div>
            <ul className="elemAttrs">
              {(elem.hasOwnProperty("@ConceptLink") && elem["@ConceptLink"] !== "") && (
                <li className="attrElem"><span className="attrLabel">ConceptLink:</span>
                <span className="attrValue"><a href={elem["@ConceptLink"]} target="_blank">{elem['@ConceptLink']}</a></span>
                </li>
              )}

              {elem.hasOwnProperty("Documentation") && (
                <li className="attrElem"><span className="attrLabel">Documentation:</span>
                {
                  elem["Documentation"] != null && elem["Documentation"].map(function(doc, index) {
                    return (
                      <span key={index} className="attrValue">{doc['$']}</span>
                    );
                  })
                }
                </li>
              )}

              {elem.hasOwnProperty("@DisplayPriority") && (
                <li className="attrElem"><span className="attrLabel">DisplayPriority:</span>
                <span className="attrValue">{elem['@DisplayPriority']}</span>
                </li>
              )}

              <li className="attrElem"><span className="attrLabel">Number of occurrences:</span>
              <span className="attrValue">{minC} - {maxC}</span>
              </li>

              {(elem['@ValueScheme'] == "string" || elem['@Multilingual'] == "true") && (
                <li className="attrElem"><span className="attrLabel">Multilingual:</span>
                <span className="attrValue">{multilingual ? "yes" : "no"}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        {attrList}
      </div>
      );
  }
});

module.exports = CMDElementView;
