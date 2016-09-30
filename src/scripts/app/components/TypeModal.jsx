'use strict';
var log = require('loglevel');

var React = require('react');

var Constants = require('../constants');

var Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var Button = require('react-bootstrap/lib/Button');
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//components
var VocabularyEditor = require('./VocabularyEditor');

//service
var Validation = require('../service/Validation');

//utils
var update = require('react-addons-update');
var classNames = require('classnames');
var ReactAlert = require('../util/ReactAlert');

require('../../../styles/EditorDialog.sass');

/**
* TypeModal - Bootstrap Modal dialog used for setting the defined Type value, Pattern value or a custom-defined Vocabulary enum.
* @constructor
*/
var TypeModal = React.createClass({
  mixins: [ImmutableRenderMixin, FluxMixin, StoreWatchMixin("ValueSchemeStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      valueScheme: flux.store("ValueSchemeStore").getState()
    };
  },

  propTypes: {
    onChange: React.PropTypes.func,
    onClose: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      reg_types: [],
      currentTabIdx: 0,
      changedTab: false,
      type: null,
      pattern: null,
      enumeration: null
    }
  },
  getDefaultProps: function() {
    return {
      title: "Edit and choose a type"
    };
  },

  componentDidMount: function() {
    log.trace("TypeModal mounted with state", this.state);
    //request loading of allowed types if not loaded yet
    if(this.state.valueScheme.allowedTypes == null) {
      this.getFlux().actions.loadAllowedTypes();
    }
  },

  tabSelect: function(tab) {
    log.trace('tabSelect: ' + tab);
    this.getFlux().actions.setValueSchemeTab(tab);
  },

  setSimpleType: function(evt) {
      this.props.onChange({
        type: this.state.valueScheme.type
      });
      this.close(evt);
  },

  setPattern: function(evt) {
    this.props.onChange({
      pattern: this.state.valueScheme.pattern
    });
    this.close(evt);
  },

  setControlVocab: function(evt) {
    this.props.onChange({
      vocabulary: this.state.valueScheme.vocabulary
    });
    this.close(evt);
  },

  showFeedback: function(message) {
    alert("Invalid vocabulary: " + message);
  },

  close: function(evt) {
    this.props.onClose(evt);
  },

  onSelectType: function(evt) {
    var type = evt.target.value;
    log.debug("select type value", type);
    this.getFlux().actions.updateType(type);
  },

  onChangePattern: function(evt) {
    var pattern = evt.target.value;
    log.debug("update pattern value", pattern);
    this.getFlux().actions.updatePattern(pattern);
  },

  handleVocabularyPropertyChange: function(itemIndex, property, newValue) {
    this.getFlux().actions.updateVocabularyItem(this.state.valueScheme.vocabulary, itemIndex, property, newValue);
  },

  handleRemoveVocabularyItem: function(itemIndex) {
    this.getFlux().actions.removeVocabularyItem(this.state.valueScheme.vocabulary, itemIndex);
  },

  render: function() {
    var patternValue = (this.state.valueScheme.pattern != undefined) ? this.state.valueScheme.pattern : "";
    var typeValue = this.state.valueScheme.type;

    return (
      <Modal.Dialog ref="modal" id="typeModal" key="typeModal" className="type-dialog" enforceFocus={true} backdrop={false}>

        <Modal.Header closeButton={true} onHide={this.close}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs activeKey={this.state.valueScheme.tab} onSelect={this.tabSelect}>
            <Tab eventKey={Constants.VALUE_SCHEME_TAB_TYPE} title="Type">
              {this.renderTypeOptions()}
            </Tab>
            <Tab eventKey={Constants.VALUE_SCHEME_TAB_VOCAB} title="Controlled vocabulary">
              <VocabularyEditor
                vocabulary={this.state.valueScheme.vocabulary}
                onVocabularyPropertyChange={this.handleVocabularyPropertyChange}
                onRemoveVocabularyItem={this.handleRemoveVocabularyItem}
                onOk={this.setControlVocab}
                />
            </Tab>
            <Tab eventKey={Constants.VALUE_SCHEME_TAB_PATTERN} title="Pattern">
              <Input ref="patternInput" type="text" value={patternValue} onChange={this.onChangePattern} label="Enter pattern:" buttonAfter={<Button onClick={this.setPattern}>Use Pattern</Button>} />
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>

      </Modal.Dialog>
    );
  },

  renderTypeOptions: function() {
    var typeValue = this.state.valueScheme.type;
    return (
      <Input
        label="Select type:" type="select"
        value={typeValue} onChange={this.onSelectType}
        buttonAfter={<Button onClick={this.setSimpleType}>Use Type</Button>}>
          {typeValue == null && <option key="null">-- Select --</option>}

          {this.state.valueScheme.allowedTypes != null &&
            $.map(this.state.valueScheme.allowedTypes, function(type, index) {
              return <option key={"type-"+type} value={type}>{type}</option>
          })}

          {this.state.valueScheme.allowedTypes == null &&
            <option key="loading">Loading, please wait...</option>
          }
      </Input>);
  },
});

module.exports = TypeModal;
