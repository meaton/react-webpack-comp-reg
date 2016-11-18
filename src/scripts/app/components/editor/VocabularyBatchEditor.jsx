'use strict';
var log = require('loglevel');

var React = require('react');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

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
        errors: []
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
      this.setState({data: evt.target.value});
    },

    render: function() {
      return (
        <div className="vocabulary-batch-editing">
          <strong>Batch editing mode</strong>
          {this.state.errors && this.state.errors.length > 0} {
            this.state.errors.map(function(err) {
              return <div className="error">{err.message} (row {err.row})</div>
            })
          }
          <div>
            <textarea value={this.state.data} onChange={this.onChange} />
          </div>
          <div>
            <Button onClick={this.submit}>Ok</Button>
            <Button onClick={this.props.onCancel}>Cancel</Button>
          </div>
        </div>
      );
    }

});

module.exports = VocabularyBatchEditor;
