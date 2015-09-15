'use strict';

var React = require('react/addons');
var Router = require('react-router');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var LinkedStateMixin = require('../../mixins/LinkedStateMixin');
var btnGroup = require('../../mixins/BtnGroupEvents');
var ValidationMixin = require('../../mixins/ValidationMixin');

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
* @LinkedStateMixin
* @BtnGroupEvents
* @Loader
* @ValidationMixin
* @Router.Navigation
* @Router.State
*/
var ComponentSpec = React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired,
    spec: React.PropTypes.object.isRequired
    //TODO: property to skip header (for root component)
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
    //ImmutableRenderMixin,
    LinkedStateMixin,
    btnGroup, ValidationMixin, Router.Navigation, Router.State],

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
            <CMDComponentView spec={item.CMD_Component} />
          </div>
        );
    }
  }
});

module.exports = ComponentSpec;
