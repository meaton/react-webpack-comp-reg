'use strict';

var React = require('react/addons');
var Router = require('react-router');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var btnGroup = require('../../mixins/BtnGroupEvents');

//components
var CMDComponentView = require('./CMDComponentView');

//utils
var update = React.addons.update;
var classNames = require('classnames');
var md5 = require('spark-md5');

require('../../../styles/ComponentViewer.sass');

/**
* ComponentViewer - view display for a CMDI Profile or Component item and its root properties, nested Components (CMDComponent), Elements, (CMDElement) and Attributes (CMDAttribute).
* @constructor
* @mixes ImmutableRenderMixin
* @BtnGroupEvents
* @Loader
* @Router.Navigation
* @Router.State
*/
var ComponentSpec = React.createClass({
  propTypes: {
    spec: React.PropTypes.object.isRequired,
    expansionState: React.PropTypes.object,
    linkedComponents: React.PropTypes.object,
    onComponentToggle: React.PropTypes.func
  },
  contextTypes: {
    router: React.PropTypes.func,
  },
  getInitialState: function() {
    return { childElements: null,
             childComponents: null
    };
  },
  mixins: [
    ImmutableRenderMixin, Router.Navigation, Router.State],

  getDefaultProps: function() {
    return {
      domains: require('../../domains.js')
    };
  },
  render: function() {
    var item = this.props.spec;

    if(item == null)
      return (
        <div className="ComponentViewer loading" />
      );
    else {
      var rootClasses = classNames({ ComponentViewer: true });
      var rootComponent = item.CMD_Component;

      // Display properties
      var conceptLink = (rootComponent && rootComponent['@ConceptLink'] != null) ? <li><span>ConceptLink:</span> <a href={rootComponent['@ConceptLink']}>{rootComponent['@ConceptLink']}</a></li> : null;

      return (
          <div className={rootClasses}>
            {/*errors*/}
            <div className="rootProperties">
              <ul>
                <li><span>Name:</span> <b>{item.Header.Name}</b></li>
                <li><span>Description:</span> {item.Header.Description}</li>
                {conceptLink}
              </ul>
            </div>
            <CMDComponentView
              spec={item.CMD_Component}
              hideProperties={true}
              onToggle={this.props.onComponentToggle}
              expansionState={this.props.expansionState}
              linkedComponents={this.props.linkedComponents}
              />
          </div>
        );
    }
  }
});

module.exports = ComponentSpec;
