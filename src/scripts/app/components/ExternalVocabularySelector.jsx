'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
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
      if(this.state.selected && this.state.selected.uuid === item.uuid) {
        //unselect
        this.setState({selected: null});
      } else {
        this.setState({selected: item});
      }
    },

    submitSelection: function(item) {
      this.props.onSelect(this.state.selected['uri'], 'skos:prefLabel');
    },

    render: function() {
      var classes = classnames('external-vocabulary-search', {
        loading: this.state.loading
      });

    return(
      <Modal.Dialog show={true} key="externalVocabModal" ref="modal" id="externalVocabModal" className="registry-dialog" enforceFocus={true} backdrop={false}>

        <Modal.Header closeButton={true} onHide={this.close}>
          <Modal.Title>Available external vocabularies</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={classes}>
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
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="external-vocabulary-search-buttons modal-inline">
            <Button onClick={this.submitSelection} disabled={this.state.selected == null}>Select</Button>&nbsp;
            <Button onClick={this.props.onCancel}>Back</Button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    );
    }

});

module.exports = ExternalVocabularySelector;
