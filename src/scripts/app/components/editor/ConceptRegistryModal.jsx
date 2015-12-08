'use strict';
var log = require('loglevel');

var React = require('react');
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
    }
  },
  getDefaultProps: function() {
    return {
      title: "Search in CLARIN Concept Registry"
    };
  },
  inputSearchUpdate: function(evt) {
    console.log('search query: ' + this.state.inputSearch);
    var self = this;
    this.setState({ data: [], currentLinkSelection: null });
    ComponentRegistryClient.queryCCR(this.state.inputSearch, function(data) {
      if(data != null) {
        log.debug("CCR response", data);
        self.setState({ data: data });
      } else {
        log.error("Failed to query CCR");
      }
    });
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
  componentDidUpdate: function(prevProps, prevState) {
    if(prevState.currentLinkSelection != this.state.currentLinkSelection) {
      var selectedClass = "selected";
      var tbody = $('#' + this.refs.table.getDOMNode().id + " tbody");
      tbody.children('.' + selectedClass).toggleClass(selectedClass);
      tbody.children().eq(this.state.currentLinkSelection).toggleClass(selectedClass);
    }
  },
  componentWillUnmount: function() {
    $(document.body).off('keydown', this.handleEnter);
  },
  componentWillMount: function() {
    $(document.body).on('keydown', this.handleEnter);

    var defaultClick = this.handleCellClick;
    var defaultProps = this.defaultCellProps;

    this.setState({ columns: [
      {
        property: 'name',
        header: 'Name',
        cell: defaultClick
      },
      {
        property: 'definition',
        header: 'Definition',
        cell: defaultClick
      },
      {
        property: 'identifier',
        header: 'Identifier',
        cell: defaultClick
      },
      {
        property: 'owner',
        header: 'Owner',
        cell: defaultClick
      },
      {
        property: 'pid',
        header: 'PersistentId',
        cell: function(value, data, rowIndex) {
          return {
            value: (value) ? (<span><a href={value} target="_blank">{value}</a></span>) : "",
            props: defaultProps(rowIndex)
          }
        }
      },
      {
        property: 'type',
        header: 'Type',
        cell: this.handleCellClick
      },
      {
        property: 'version',
        header: 'Version',
        cell: this.handleCellClick
      }
    ]});
  },
  componentDidMount: function() {
    //this.props.onChange(this.getDOMNode());
  },
  defaultCellProps: function(rowIndex) {
    var self = this;
    var isEven = (rowIndex % 2);

    return {
      onClick: function(evt) {
        self.setState({ currentLinkSelection: rowIndex });
      },
      className: classNames({ odd: !isEven, even: isEven })
    };
  },
  handleCellClick: function(value, data, rowIndex) {
    return {
      value: value,
      props: this.defaultCellProps(rowIndex)
    };
  },
  loadTestdata: function() {
    this.setState({ data: testdata, currentLinkSelection: null });
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
      <Modal ref="modal" id="ccrModal" key="ccrModal" className="registry-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.close} container={this.props.container}>
        <div className='modal-body'>
          <Input type="text" placeholder="Type keyword (at least 2 characters) and press Enter to search" valueLink={this.linkState('inputSearch')} addonBefore={<Glyphicon glyph='search' />} buttonAfter={
              <Button onClick={this.inputSearchUpdate} disabled={this.state.inputSearch.length <= 1}>Search</Button>
            }/>
          <Table id="ccrTable" ref="table" columns={this.state.columns} data={this.state.data} header={conceptRegHeader} className={tableClasses} />
        </div>
        <div className="modal-footer">
          <Button onClick={this.confirm} disabled={this.state.currentLinkSelection == null}>Ok</Button>
          <Button onClick={this.clear}>Clear Setting</Button>
          <Button onClick={this.close}>Cancel</Button>
        </div>
      </Modal>
    );
  }
});

module.exports = ConceptRegistryModal;
