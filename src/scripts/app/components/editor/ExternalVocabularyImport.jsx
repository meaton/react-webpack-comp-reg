'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

//utils
var ComponentRegistryClient = require('../../service/ComponentRegistryClient');
var classnames = require('classnames');

var ExternalVocabularyImport = React.createClass({

    mixins: [ImmutableRenderMixin],

    propTypes: {
      onClose: React.PropTypes.func.isRequired,
    },

    getInitialState: function() {
      return {
      }
    },

    render: function() {
      var classes = classnames('external-vocabulary-import');

    return(
      <Modal.Dialog show={true} key="externalVocabModal" ref="modal" id="externalVocabModal" className="registry-dialog" enforceFocus={true} backdrop={false}>

        <Modal.Header closeButton={true} onHide={this.props.onClose}>
          <Modal.Title>Import external vocabulary</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={classes}>

          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="external-vocabulary-search-buttons modal-inline">
            {/*<Button onClick={this.submitSelection} disabled={this.state.selected == null}>Select</Button>&nbsp;*/}
            <Button onClick={this.props.onClose}>Cancel</Button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    );
    }

});

module.exports = ExternalVocabularyImport;
