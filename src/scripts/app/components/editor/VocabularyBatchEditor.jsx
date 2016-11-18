'use strict';
var log = require('loglevel');

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//service
var VocabularyCsvService = require('../../service/VocabularyCsvService');

var VocabularyBatchEditor = React.createClass({
    mixins: [ImmutableRenderMixin],

    propTypes: {
      items: React.PropTypes.array.isRequired,
      onClose: React.PropTypes.func,
      onCancel: React.PropTypes.func
    },

    getInitialState: function() {
      return {
        data: "",
        errors: null,
        helpShown: false
      }
    },

    componentDidMount: function() {
      this.createCsvFromItems();
    },

    componentDidUpdate: function(prevProps, prevState) {
      if(prevProps.items != this.props.items) {
        this.createCsvFromItems();
      }
    },

    createCsvFromItems: function() {
      this.setState({
        data: VocabularyCsvService.serializeItems(this.props.items)
      });
    },

    submit: function() {
      try {
        var items = VocabularyCsvService.deserializeItems(this.state.data);
        this.props.onClose(items);
      } catch(errors) {
        log.warn("Errors while deserializing vocabulary items from csv", errors, this.state.data);
        this.setState({errors: errors});
      }
     },

    onChange: function(evt) {
      this.setState({errors: null, data: evt.target.value});
    },

    toggleHelp: function() {
      this.setState({helpShown: !this.state.helpShown});
    },

    render: function() {
      return (
        <div className="vocabulary-batch-editing">
          <strong>Batch editing mode</strong> <a onClick={this.toggleHelp}><Glyphicon glyph="question-sign" /></a>
          {this.state.helpShown &&
            <div class="vocabulary-batch-editing-help">
              <p>You can freely edit the comma separated value (CSV) content below, or copy and paste between the text field and an external editor. Make sure to always use UTF-8 encoding when importing into e.g. Excel.</p>
              <p>Format: <code>value, description, concept link</code></p>
              <p>Each line represents a vocabulary item. Empty lines are ignored. The separator character is comma (,) and quotes can be used to include commas into values (e.g. <code>"a single, legal, value","another value"</code>). The second and third columns are optional.</p>
            </div>
          }
          {this.state.errors != null && this.state.errors.length > 0 &&
            this.state.errors.map(function(err, idx) {
              return <div key={idx} className="error">{err.message}{err.row && <span> (row {err.row})</span>}</div>
            })
          }
          <div>
            <textarea value={this.state.data} onChange={this.onChange} />
          </div>
          <div>
            <Button onClick={this.submit}>Ok</Button> <Button onClick={this.props.onCancel}>Cancel</Button>
          </div>
        </div>
      );
    }

});

module.exports = VocabularyBatchEditor;
