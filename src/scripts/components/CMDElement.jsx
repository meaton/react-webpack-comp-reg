'use strict';

var React = require('react');
var CMDAttribute = require('./CMDAttribute');

var Input = require('react-bootstrap/lib/Input');
var LinkedStateMixin = require('../mixins/LinkedStateMixin.js');
var ImmutableRenderMixin = require('react-immutable-render-mixin');

var update = React.addons.update;

require('../../styles/CMDElement.sass');

var CMDElement = React.createClass({
  mixins: [LinkedStateMixin, ImmutableRenderMixin],
  getInitialState: function() {
    return { elem: this.props.elem, editMode: (this.props.editMode != undefined) ? this.props.editMode : false };
  },
  toggleElement: function(evt) {
    console.log('toggle elem: ' + JSON.stringify(this.state.elem));
    var isOpen = (this.state.elem.hasOwnProperty('open')) ? !this.state.elem.open : true;
    this.setState({ elem: update(this.state.elem, { open: { $set: isOpen }}) });
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
  componentWillReceiveProps: function(nextProps) {
    console.log('elem will received new props');
    var elem = this.state.elem;
    console.log('elem props: ' + JSON.stringify(nextProps.elem));
    console.log('elem props: ' + this.props.elem.open);

    if(nextProps.elem.hasOwnProperty('open') && (this.state.elem.open != nextProps.elem.open)) { // open/close all
      elem = update(elem, { open: { $set: nextProps.elem.open }});
      this.setState({ elem: elem });
    }
  },
  componentDidMount: function() {
    var elem = this.state.elem;

    if(elem.AttributeList != undefined && !$.isArray(elem.AttributeList.Attribute)) {
      elem.AttributeList.Attribute = [elem.AttributeList.Attribute];
    }

    this.setState({ elem: update(elem, { open: { $set: true }}) });

    console.log('mounted element: ' + JSON.stringify(elem));
  },
  componentWillUpdate: function(nextProps, nextState) {
    console.log('element will update');
    console.log(JSON.stringify(this.props.elem));
    console.log(JSON.stringify(nextState.elem));

    if(JSON.stringify(this.props.elem) != JSON.stringify(nextState.elem))
      this.props.onUpdate(nextState.elem);
  },
  render: function () {
    var self = this;
    var elem = this.state.elem;

    var valueScheme = this.props.viewer.getValueScheme(elem);

    console.log('rendering element: ' + require('util').inspect(elem));

    if(this.state.editMode) {
      var minC = (elem.hasOwnProperty('@CardinalityMin')) ? elem['@CardinalityMin'] : "1";
      var maxC = (elem.hasOwnProperty('@CardinalityMax')) ? elem['@CardinalityMax'] : "1";
      var cardOpt = ( <span>Cardinality: {minC + " - " + maxC}</span> );

      var cx = React.addons.classSet;
      var elementClasses = cx({
        'CMDElement': true,
        'edit-mode': this.state.editMode,
        'open': this.state.elem.open
      });

      var elemName = (elem['@name'] == "") ? "[New Element]" : elem['@name'];
      if(this.state.elem.open) {
        var nameLink = this.linkState('elem.@name');
        //TODO bind conceptLink
        var minComponentLink = this.linkState('elem.@CardinalityMin');
        var maxComponentLink = this.linkState('elem.@CardinalityMax');
        var docuLink = this.linkState('elem.@Documentation');
        var displayPriorityLink = this.linkState('elem.@DisplayPriority');
        var multiLink = this.linkState('elem.@Multilingual');

        var handleOccMinChange = function(e) {
            console.log('comp change: ' + e.target);
            if(minComponentLink != null) {
              minComponentLink.requestChange(e.target.value);
            }
        };

        var handleOccMaxChange = function(e) {
          console.log('comp change: ' + e.target);
          if(maxComponentLink != null) {
            maxComponentLink.requestChange(e.target.value);
          }
        };

        var handleMultiChange = function(e) {
          console.log('multi change: ' + (e.target.checked));
          if(multiLink != null)
            multiLink.requestChange((e.target.checked) ? 'true' : 'false');
        }

        var valueScheme = this.props.viewer.getValueScheme(this.state.elem);

        // elem props
        //TODO bind updates to parent
        var elemProps = (
          <div className="elementProps">
            <Input type="text" label="Name" defaultValue={this.state.elem['@name']} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, nameLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            <Input type="text" label="ConceptLink" value={this.state.elem['@ConceptLink']} buttonAfter={this.props.viewer.conceptRegistryBtn()} labelClassName="col-xs-1" wrapperClassName="col-xs-3" />
            <Input type="text" label="Documentation" defaultValue={this.state.elem['@Documentation']} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, docuLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            <Input type="number" label="DisplayPriority" min={0} max={10} step={1} defaultValue={(this.state.elem.hasOwnProperty('@DisplayPriority')) ? this.state.elem['@DisplayPriority'] : 0} onChange={this.props.viewer.handleInputChange.bind(this.props.viewer, displayPriorityLink)} labelClassName="col-xs-1" wrapperClassName="col-xs-2" />
            {valueScheme}
            <Input type="checkbox" label="Multilingual" defaultChecked={(this.state.elem.hasOwnProperty('@Multilingual')) ? this.state.elem['@Multilingual'] == "true" : false} onChange={handleMultiChange} wrapperClassName="col-xs-2 col-xs-offset-1" />
          </div>
        );

        return (
          <div className={elementClasses}>
            <span>Element: <a className="elementLink" onClick={this.toggleElement}>{elemName}</a></span> {cardOpt}
            <form className="form-horizontal form-group">
              {elemProps}
              <Input type="select" label="Min Occurrences" defaultValue={minC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMinChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option key={index} value={index}>{index}</option>
                })}
              </Input>
              <Input type="select" label="Max Occurrences" defaultValue={maxC} labelClassName="col-xs-1" wrapperClassName="col-xs-2" onChange={handleOccMaxChange}>
                <option value="unbounded">unbounded</option>
                {$.map($(Array(10)), function(item, index) {
                  return <option key={index} value={index}>{index}</option>
                })}
              </Input>
            </form>
          </div>
        );
      } else {
        var displayPr = (elem['@DisplayPriority']) ? " Display priority: " + elem['@DisplayPriority'] : "";
        var valSch = (typeof valueScheme == "string") ? valueScheme : "";

        return (
          <div className={elementClasses}>Element: <a onClick={this.toggleElement}>{elemName}</a> Type: {valSch} {cardOpt} {displayPr}</div>
        );
      }
    }

    var attrList = null;
    if(elem.AttributeList != undefined) {
      var attrSet = ($.isArray(elem.AttributeList.Attribute)) ? elem.AttributeList.Attribute : elem.AttributeList;
      attrList = (
        <div className="attrList">AttributeList:
          {
            $.map(attrSet, function(attr, index) {
              return <CMDAttribute key={"attr_elem_" + index} attr={attr} getValue={self.props.viewer.getValueScheme}/>;
            })
          }
        </div>
      );
    }

    return (
      <div className="CMDElement">
        <span>Element: </span>
        <b>{elem['@name']}</b> { valueScheme }
        <div className="elemAttrs">
          {this.elemAttrs(elem)}
        </div>
        {attrList}
      </div>
      );
  }
});

module.exports = CMDElement;
