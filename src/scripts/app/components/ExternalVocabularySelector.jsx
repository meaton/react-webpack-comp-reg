'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var ComponentRegistryClient = require('../service/ComponentRegistryClient');
var classnames = require('classnames');

var ExternalVocabularySelector = React.createClass({

    mixins: [ImmutableRenderMixin],

    propTypes: {
      onSelect: React.PropTypes.func.isRequired,
      onCancel: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        loading: false,
        vocabularies: [],
        error: null,
        selected: null
      }
    },

    componentDidMount: function() {
      this.doQuery();
    },

    componentDidUpdate: function(prevProps, prevState) {
    },

    doQuery: function() {
      this.setState({
        loading: true,
        error: null}
      );
      ComponentRegistryClient.queryVocabularies(function(data) {
        if(data == null) {
          this.setState({
            loading: false,
            error: "Failed to retrieve vocabularies"
          });
        }
        log.debug("Retrieved vocabularies", data);
        this.setState({
          loading: false,
          vocabularies: data.response.docs
        });
      }.bind(this));
    },

    selectItem: function(item) {
      this.setState({selected: item});
    },

    submitSelection: function(item) {
      this.props.onSelect(this.state.selected['uri'], 'prop');
    },

    render: function() {
      var classes = classnames('external-vocabulary-search', {
        loading: this.state.loading
      });
      return (<div className={classes}>
        Available CLAVAS vocabularies:
        <div>
          {this.state.loading && <strong>Retrieving vocabularies</strong>}
          {this.state.error && <div className="error">{this.state.error}<br /><a onClick={this.doQuery}>Try again</a></div>}
        </div>
        <div className="external-vocabulary-items">
          {!this.state.loading && this.state.vocabularies.length == 0 && <strong>No vocabularies found</strong>}
          {this.state.vocabularies.map(function(item, idx){
            var title = item['title@en'] || item['title'] || "[No title]";
            var description = item['description@en'];
            var itemClasses = classnames('external-vocabulary-item', {
              selected: this.state.selected && this.state.selected.uuid === item.uuid
            });
            return (
              <div onClick={this.selectItem.bind(null, item)} className={itemClasses} key={idx}>
                <div className="title">{title}</div>
                {description &&
                  <div className="description">{description}</div>
                }
              </div>);
          }.bind(this))}
        </div>
        <div>
          <Button onClick={this.submitSelection} disabled={this.state.selected == null}>Select</Button>
          <Button onClick={this.props.onCancel}>Cancel</Button>
        </div>
      </div>);
    }

});

module.exports = ExternalVocabularySelector;
