'use strict';

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//components
var CMDComponentView = require('./CMDComponentView');

//utils
var update = require('react-addons-update');
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../../styles/ComponentViewer.sass');

/**
* ComponentViewer - view display for a CMDI Profile or Component item and its root properties, nested Components (CMDComponent), Elements, (CMDElement) and Attributes (CMDAttribute).
* @constructor
*/
var ComponentSpec = React.createClass({
  mixins: [ImmutableRenderMixin],

  contextTypes: {
    router: React.PropTypes.func,
  },

  propTypes: {
    spec: React.PropTypes.object.isRequired,
    expansionState: React.PropTypes.object,
    linkedComponents: React.PropTypes.object,
    onComponentToggle: React.PropTypes.func
  },

  getInitialState: function() {
    return { childElements: null,
             childComponents: null
    };
  },

  render: function() {
    var spec = this.props.spec;

    if(spec == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else {
      var rootClasses = classNames({ ComponentViewer: true });
      var rootComponent = spec.Component;

      // Determine root spec (should be inline, but may be linked)
      var isLinked = rootComponent.hasOwnProperty("@ComponentRef");
      var rootSpec = null;
      if(isLinked) {
        var compId = rootComponent['@ComponentRef'];
        //linked root component, use full spec for linked components if available (should have been preloaded)
        var linkedSpecAvailable = this.props.linkedComponents != undefined
                      && this.props.linkedComponents.hasOwnProperty(compId);
        if(linkedSpecAvailable) {
          rootSpec = this.props.linkedComponents[compId].Component;
        }
      } else {
        rootSpec = rootComponent;
      }

      // Display properties
      var conceptLink = (rootComponent && rootComponent['@ConceptLink'] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent['@ConceptLink']}>{rootComponent['@ConceptLink']}</a></li> : null;

      return (
          <div className={rootClasses}>
            <div className="rootProperties">
              <ul>
                <li><span>Name:</span> <b>{spec.Header.Name}</b></li>
                <li><span>Description:</span> {spec.Header.Description}</li>
                {conceptLink}
                {spec.Header && spec.Header.DerivedFrom &&
                  <li><span>Derived from: {spec.Header.DerivedFrom}</span></li>
                }
              </ul>
            </div>
            {rootSpec == null ? (
              <span>Loading...</span>
            ):(
              <CMDComponentView
                spec={rootSpec}
                hideProperties={!isLinked}
                isLinked={isLinked}
                onToggle={this.props.onComponentToggle}
                expansionState={this.props.expansionState}
                linkedComponents={this.props.linkedComponents}
                />
            )}
            <div className="end">&nbsp;</div>
          </div>
        );
    }
  }
});

module.exports = ComponentSpec;
