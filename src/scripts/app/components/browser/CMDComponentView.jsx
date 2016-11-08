'use strict';

var log = require('loglevel');
var React = require('react');
var Constants = require('../../constants');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');
var CMDComponentMixin = require('../../mixins/CMDComponentMixin');
var ToggleExpansionMixin = require('../../mixins/ToggleExpansionMixin');
var ActionButtonsMixin = require('../../mixins/ActionButtonsMixin');

//components
var CMDElementView = require('./CMDElementView');
var CMDAttributeView = require('./CMDAttributeView');
var DocumentationView = require('./DocumentationView');

//bootstrap
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

require('../../../../styles/CMDComponent.sass');

/**
* CMDComponent - view display and editing form for a CMDI Component item.
* @constructor
* @mixes ImmutableRenderMixin
* @mixes ActionButtonsMixin
*/
var CMDComponentView = React.createClass({
  mixins: [ImmutableRenderMixin, CMDComponentMixin, ToggleExpansionMixin, ActionButtonsMixin],

  /* other props defined in CMDComponentMixin, ToggleExpansionMixin and ActionButtonsMixin */
  propTypes: {
    link: React.PropTypes.object /* if linked, this is the Component element defined in the parent */,
    componentLinks: React.PropTypes.bool,
    compId: React.PropTypes.string,
    onReplaceWithSuccessor: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      componentLinks: true
    };
  },
  /**
   * Components should be closed by default iff they are linked
   * @return {boolean}
   */
  getDefaultOpenState: function() {
    return !this.props.isLinked;
  },

  /*=== Render functions ===*/

  /* main render() function in CMDComponentMixin */

  renderNestedComponent: function(spec, header, compId, isLinked, linkedSpecAvailable, index) {
    if(isLinked && !linkedSpecAvailable) {
      return (<div key={compId}>Component {compId} loading...</div>);
    } else {
      var link = isLinked ? this.props.spec.Component[index] : null;
      // forward child expansion state
      return (<CMDComponentView
        key={spec._appId}
        spec={spec}
        header={header}
        parent={this.props.spec}
        expansionState={this.props.expansionState}
        linkedComponents={this.props.linkedComponents}
        onToggle={this.props.onToggle}
        isLinked={isLinked}
        isFirst={index == 0}
        isLast={index == this.props.spec.Component.length - 1}
        link={link}
        compId={compId}
        />);
    }
  },

  renderAttribute: function(attr) {
    return (<CMDAttributeView key={attr._appId} spec={attr} />);
  },

  renderElement: function(elem) {
    return (<CMDElementView key={elem._appId} spec={elem} />);
  },

  renderComponentProperties: function(comp) {
    var header = comp.Header;
    var compName = (header != undefined) ? header.Name : comp['@name']; // TODO: use @name attr only

    var compId;
    if(comp.hasOwnProperty("@ComponentRef"))
      compId = comp["@ComponentRef"];
    else if(comp.Header != undefined)
      compId = comp.Header.ID;
    else
      compId = null;

    var open = this.isOpen();

    if(!open && (compId != null && !comp.hasOwnProperty('@name') && this.props.componentName != null))
       compName = this.props.componentName;
    else if(comp.hasOwnProperty("@name"))
      compName = comp['@name'];

    var conceptLink = comp['@ConceptLink'];

    var minC = this.props.link != null ? this.props.link['@CardinalityMin'] : comp['@CardinalityMin'];
    if(minC == null) minC = 1;

    var maxC = this.props.link != null ? this.props.link['@CardinalityMax'] : comp['@CardinalityMax'];
    if(maxC == null) maxC = 1;

    var cardinality = (<span>{minC + " - " + maxC}</span>);
    var status = this.props.header && this.props.header.Status;
    //TODO: make title link to component in browser https://github.com/clarin-eric/component-registry-front-end/issues/27
    var titleText = (
      <span  title={this.props.isLinked && this.props.compId ? this.props.compId : compName}>
        {status && status.toLowerCase() === Constants.STATUS_DEVELOPMENT.toLowerCase() &&
          <span title="Status: development"> <Glyphicon glyph={Constants.STATUS_ICON_DEVELOPMENT} /> </span>
        }
        {status && status.toLowerCase() === Constants.STATUS_DEPRECATED.toLowerCase() &&
          <span title="Status: deprecated"> <Glyphicon glyph={Constants.STATUS_ICON_DEPRECATED} /> </span>
        }
          Component: <span className="componentName">{compName}</span> {!open && (<span>&nbsp;[{cardinality}]</span>)}
      </span>);
    var title = this.props.isLinked?
      this.createActionButtons({title: titleText}) // add expansion controls
      :titleText;
    var documentation = comp['Documentation'];

    return (
      <div className="panel panel-info">
        <div className="panel-heading">{title}</div>
        {open && !this.props.hideCardinality &&
          <div className="panel-body componentProps">
            <div>
              Number of occurrences: {cardinality}
            </div>
            {conceptLink && conceptLink != '' && (
              <div>ConceptLink: <a href={conceptLink} target="_blank">{conceptLink}</a>
              </div>
            )}
            <div>
              {$.isArray(documentation) && documentation.length > 0 && documentation[0]['$'] != null && documentation[0]['$'] != '' && (
                <div>Documentation:
                  <div>{<DocumentationView value={documentation} />}</div>
                </div>
              )}
            </div>
          </div>}

        {this.props.onReplaceWithSuccessor &&
        <div className="successor-available"><Glyphicon glyph="info-sign" /> A successor is available for this component. <a onClick={this.props.onReplaceWithSuccessor}>Replace with successor?</a></div>}
        {open && this.props.formElements}
      </div>
    );
  }
});

module.exports = CMDComponentView;
