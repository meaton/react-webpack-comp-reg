'use strict';
var log = require('loglevel');

var React = require('react');
var ReactDOM = require('react-dom');
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

//mixins
var LinkedStateMixin = require('react-addons-linked-state-mixin');

//bootstrap
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Button = require('react-bootstrap/lib/Button');

//utils
var ComponentRegistryClient = require('../../service/ComponentRegistryClient');
var update = require('react-addons-update');
var classNames = require('classnames');

require('../../../../styles/EditorDialog.sass');
/**
* ConceptRegistryModal - Bootstrap Modal dialog for setting the Concept Registry (CCR) link.
* @constructor
* @mixes Loader
* @mixes require('react-addons-linked-state-mixin')
*/
var ConceptRegistryModal = React.createClass({
  mixins: [LinkedStateMixin],

  propTypes: {
    onSelect: React.PropTypes.func.isRequired,
    container: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      data: [],
      columns: [],
      inputSearch: "",
      currentLinkSelection: null,
      helpShown: false,
      queryError: null,
      queryDone: false
    }
  },

  getDefaultProps: function() {
    return {
      title: "Search in CLARIN Concept Registry",
      show: true
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(prevState.currentLinkSelection != this.state.currentLinkSelection) {
      var selectedClass = "selected";
      var tbody = $('#' + ReactDOM.findDOMNode(this.refs.table).id + " tbody");
      tbody.children('.' + selectedClass).toggleClass(selectedClass);
      tbody.children().eq(this.state.currentLinkSelection).toggleClass(selectedClass);
    }
  },

  componentWillUnmount: function() {
    $(document.body).off('keydown', this.handleEnter);
  },

  componentWillMount: function() {
    $(document.body).on('keydown', this.handleEnter);

    this.setState({ columns: this.getColumnsDefinition()});
  },

  render: function() {
    var self = this;
    var tableClasses = classNames('table', 'table-bordered', 'table-hover', 'table-striped', 'table-condensed');
    var conceptRegHeader = {
      onClick: function(col) {
        sortColumn(self.state.columns, col, self.state.data, self.setState.bind(self));
      }
    };

    return (
      <Modal.Dialog show={this.props.show} key="ccrModal" ref="modal" id="ccrModal" className="registry-dialog" enforceFocus={true} backdrop={false}>

        <Modal.Header closeButton={true} onHide={this.close}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Input
            type="text" placeholder="Type keyword (at least 2 characters) and press Enter to search"
            valueLink={this.linkState('inputSearch')}
            addonBefore={<Glyphicon glyph='search' />}
            buttonAfter={
              <Button onClick={this.inputSearchUpdate} disabled={this.state.inputSearch.length <= 1}>Search</Button>
            }
            />
          {this.state.queryDone && this.state.data != null && <div>
            {this.state.data.length} results:
          </div>}
          {this.state.queryError != null && <div class='error'>
            {this.state.queryError}
          </div>}
          {/*<Table   data={this.state.data} header={conceptRegHeader}  />*/}
          <Table.Provider id="ccrTable" ref="table" className={tableClasses} columns={this.state.columns}>
            <Table.Header />
            <Table.Body rows={this.state.data} rowKey="identifier" />
          </Table.Provider>
          <a onClick={this.toggleHelp}><Glyphicon glyph='question-sign' /></a>
          {this.state.helpShown &&
            <div>
              <p>Hover the mouse over the search results to see full labels. Click the PersistentId to go to the concept's entry in the concept registry</p>
              <p>You can use wildcards, parentheses and the special keywords 'AND', 'OR' and 'NOT' in your query as well as the '-' prefix to exclude terms. <br />
              Some examples of valid queries:</p>
              <ul>
                <li>convers*</li>
                <li>person AND name</li>
                <li>subject OR topic</li>
                <li>language AND (code OR name)</li>
                <li>language NOT (code OR name)</li>
                <li>language -code</li>
              </ul>
              <p>Click the 'Clear setting' button to unset the current concept for the current component, element or attribute.</p>
            </div>
        }
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.confirm} disabled={this.state.currentLinkSelection == null}>Ok</Button>
          <Button onClick={this.clear}>Clear Setting</Button>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  },

  /*=== Event handlers ====*/

  inputSearchUpdate: function(evt) {
    console.log('search query: ' + this.state.inputSearch);
    var self = this;
    this.setState({ data: [], currentLinkSelection: null });
    ComponentRegistryClient.queryCCR(this.state.inputSearch, function(data) {
      if(data != null) {
        log.debug("CCR response", data);
        self.setState({ data: data, queryDone: true, queryError: null });
      } else {
        self.setState({data: null, queryError: "Failed to query concept registry"})
        log.error("Failed to query CCR");
      }
    });
  },

  toggleHelp: function(evt) {
    this.setState({helpShown: !this.state.helpShown});
  },

  handleEnter: function(evt) {
    if(evt.keyCode == 13) {
      console.log('enter: ' + this.state.inputSearch);
      this.inputSearchUpdate();
    }
  },

  confirm: function(evt) {
    var selectedValue = (this.state.currentLinkSelection != null) ? this.state.data[this.state.currentLinkSelection].pid : "";
    this.assignValue(selectedValue);
    this.close();
  },

  clear: function(evt) {
    this.assignValue("");
    this.close();
  },

  close: function(evt) {
    this.props.onClose(evt);
  },

  assignValue: function(value) {
    this.props.onSelect(value);
  },

  /*=== Table definition ====*/

  getColumnsDefinition: function() {
    return [
      {
        property: 'name',
        header: {label: 'Name'},
        cell: {format: this.handleCellWithTooltip}
      },
      {
        property: 'definition',
        header: {label: 'Definition'},
        cell: {format: this.handleCellWithTooltip}
      },
      {
        property: 'identifier',
        header: {label:  'Identifier'},
        cell: {format: this.handleCellWithTooltip}
      },
      {
        property: 'owner',
        header: {label: 'Owner'},
        cell: {format: this.handleCellClick}
      },
      {
        property: 'pid',
        header: {label: 'PersistentId'},
        cell: {format: this.handlePidLink}
      },
      {
        property: 'type',
        header: {label: 'Type'},
        cell: {format: this.handleCellClick}
      },
      {
        property: 'version',
        header: {label: 'Version'},
        cell: {format: this.handleCellClick}
      }
    ];
  },

  handleCellSelect: function(rowIndex) {
    this.setState({ currentLinkSelection: rowIndex });
  },

  getCellClasses: function(rowIndex) {
    var isEven = (rowIndex % 2);
    return classNames({ odd: !isEven, even: isEven });
  },

  handleCellWithTooltip: function(value, extras) {
    return (<span
        title={value}
        className={this.getCellClasses(extras.rowIndex)}
        onClick={this.handleCellSelect.bind(this, extras.rowIndex)}
      >{value}</span>
    );
  },

  handleCellClick: function(value, extras) {
    return (<span
      className={this.getCellClasses(extras.rowIndex)}
      onClick={this.handleCellSelect.bind(this, extras.rowIndex)}
    >{value}</span>);
  },

  handlePidLink: function(value, extras) {
    if(value == null) {
      return "";
    } else {
      return (<span
        className={this.getCellClasses(extras.rowIndex)}
        onClick={this.handleCellSelect.bind(this, extras.rowIndex)}
        ><a title={value} href={value} target="_blank">{
        value.replace(new RegExp("^https?:\/\/hdl.handle.net\/([0-9]+\/)?"), "") //TODO: REGEX?
      }</a></span>);
    }
  }
});

module.exports = ConceptRegistryModal;
