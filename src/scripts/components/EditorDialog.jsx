'use strict';

var React = require('react/addons');
var update = React.addons.update;

var Draggable = require('react-draggable');
var Modal = require('react-bootstrap/lib/Modal');
var Input = require('react-bootstrap/lib/Input');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');
var Button = require('react-bootstrap/lib/Button');
var TabbedArea = require('react-bootstrap/lib/TabbedArea');
var TabPane = require('react-bootstrap/lib/TabPane');

// Reactabular
var Table = require('reactabular').Table;
var sortColumn = require('reactabular').sortColumn;

var classNames = require('classnames');

require('../../styles/EditorDialog.sass');

var EditorDialog = React.createClass({
  render: function() {
    return <ModalTrigger {...this.props} />
  }
});

var TypeModal = React.createClass({
  getInitialState: function() {
    return {
      basic_type: 'string',
      pattern: null,
      vocab: null,
      currentTabIdx: 0,
      changedTab: false,
      contextItem: null,
      value: null
    }
  },
  getDefaultProps: function() {
    return {
      title: "Edit and choose a type"
    };
  },
  tabSelect: function(index) {
    console.log('tabSelect: ' + index);
    this.setState({ currentTabIdx: index, changedTab: true });
  },
  setSimpleType: function(evt) {
    var target = this.props.target;
    var typeInput = target.refs.typeInput;
    var simpleVal = this.refs.simpleTypeInput.getValue();

    if(target.state.attr != undefined)
      typeInput.props.onChange("Type", simpleVal);
    else if(target.state.elem != undefined)
      typeInput.props.onChange("@ValueScheme", simpleVal);

    this.close();
  },
  setPattern: function(evt) {
    this.props.target.refs.typeInput.props.onChange("pattern", this.refs.patternInput.getValue());
    this.close();
  },
  setControlVocab: function(evt) {
    if(this.state.value.enumeration != undefined && $.isArray(this.state.value.enumeration.item))
      this.props.target.refs.typeInput.props.onChange("enumeration", this.state.value.enumeration);
    this.close();
  },
  close: function(evt) {
    this.props.onRequestHide();
  },
  componentWillMount: function() {
    var contextItem = null;
    var state = this.props.target.state;
    if(state.attr != undefined)
      contextItem = state.attr;
    else if(state.elem != undefined)
      contextItem = state.elem;

    if(contextItem != null) {
      var existingValue = (contextItem.hasOwnProperty('@ValueScheme') || contextItem.hasOwnProperty('Type')) ?
                            contextItem['@ValueScheme']||contextItem['Type'] :
                            contextItem['ValueScheme'];
      if(contextItem.ValueScheme != undefined) {
        if(contextItem['ValueScheme'].enumeration != undefined)
          this.setState({ contextItem: contextItem, value: existingValue, currentTabIdx: 1 });
        else if(contextItem['ValueScheme'].pattern != undefined)
          this.setState({ contextItem: contextItem, value: existingValue, currentTabIdx: 2 });
      } else
        this.setState({ contextItem: contextItem, value: existingValue });
    }
  },
  addConceptLink: function(rowIndex, newHdlValue) {
    console.log('open concept link dialog: ' + rowIndex, newHdlValue);
    if(this.state.value != null && this.state.value.enumeration != undefined) {
      var newRow = update(this.state.value.enumeration.item[rowIndex], { '@ConceptLink': { $set: newHdlValue } });
      var newValue = update(this.state.value, { enumeration: { item: { $splice: [[rowIndex, 1, newRow]] } } });
      this.setState({ value: newValue });
    }
  },
  addNewRow: function() {
    console.log('add new row test');
    var val = this.state.value;
    if(val.enumeration == undefined)
      if(typeof val === "string" || val.pattern != undefined)
        val = { enumeration: "" };

    if(val.enumeration.item != undefined)
      this.setState({ value: update(val, { enumeration: { item: { $push: [{'$':'', '@AppInfo':'', '@ConceptLink':''}] }}}) });
    else
      this.setState({ value: update(val, { enumeration: { $set: { item: [{'$':'', '@AppInfo':'', '@ConceptLink':''}] }}}) });
  },
  removeRow: function(rowIndex) {
    console.log('remove row: ' + rowIndex);
    this.setState({ value: update(this.state.value, { enumeration: { item: { $splice: [[rowIndex, 1]] }}}) });
  },
  componentDidMount: function() {
    this.props.onChange(this.getDOMNode());
  },
  componentDidUpdate: function() {
    this.props.onChange(this.getDOMNode());
  },
  render: function() {
    var self = this;
    var tableClasses = classNames('table', 'table-striped', 'table-condensed');

    var cells = require('reactabular').cells;
    var editors = require('reactabular').editors;
    var editable = cells.edit.bind(this, 'editedCell', function(value, celldata, rowIndex, property) {
        console.log('row data update: ' + value, celldata, rowIndex, property);
        var newData = celldata[rowIndex];
        newData[property] = value;
        var newValue = update(self.state.value, { enumeration: { item: { $splice: [[rowIndex, 1, newData]] }} });
        self.setState({ value: newValue });
    });

    var vocabData = (this.state.value.hasOwnProperty('enumeration')) ? this.state.value.enumeration.item : [];
    var vocabCols = [
      {
        property: '$',
        header: 'Value',
        cell: [
          editable({editor: editors.input()})
        ]
      }, {
        property: '@AppInfo',
        header: 'Description',
        cell: [
          editable({editor: editors.input()})
        ]
      }, {
        property: '@ConceptLink',
        header: 'Concept link',
        cell: function(value, data, rowIndex) {
          return {
            value: (value) ? (<span><a href={value} target="_blank">{value}</a></span>) : (<span><ModalTrigger type="ConceptRegistry" label="add link" useLink={true} container={self.props.container} target={self} onClose={self.addConceptLink.bind(self, rowIndex)} /></span>)
          };
        }
      },
      {
        cell: function(value, data, rowIndex, property) {
          return {
              value: (
                <span>
                  <span onClick={self.removeRow.bind(self, rowIndex)} style={{cursor: 'pointer'}}>&#10007;</span>
                </span>
              )
          };
        }
      }
    ];

    return (
      <Modal ref="modal" id="typeModal" key="typeModal" className="type-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
        <div className='modal-body'>
          <TabbedArea activeKey={this.state.currentTabIdx} onSelect={this.tabSelect}>
            <TabPane eventKey={0} tab="Type">
              <Input ref="simpleTypeInput" defaultValue={(this.state.contextItem.hasOwnProperty('@ValueScheme') || this.state.contextItem.hasOwnProperty('Type')) ? this.state.value : "string"} label="Select type:" type="select" buttonAfter={<Button onClick={this.setSimpleType}>Use Type</Button>}>
              {$.map(['boolean', 'decimal', 'float', 'int', 'string', 'anyURI', 'date', 'gDay', 'gMonth', 'gYear', 'time', 'dateTime'], function(type, index) {
                return <option key={index}>{type}</option>
              })}
              </Input>
            </TabPane>
            <TabPane eventKey={1} tab="Controlled vocabulary">
              <Table id="typeTable" ref="table" columns={vocabCols} data={vocabData} className={tableClasses}>
                <tfoot>
                  <tr>
                      <td className="table-row-clickable info" onClick={this.addNewRow}>
                          Click here to add new row.
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                  </tr>
                </tfoot>
              </Table>
              <div className="modal-inline"><Button onClick={this.setControlVocab} disabled={vocabData.length <= 0}>Use Controlled Vocabulary</Button></div>
            </TabPane>
            <TabPane eventKey={2} tab="Pattern">
              <Input ref="patternInput" type="text" defaultValue={(this.state.contextItem.hasOwnProperty('ValueScheme') && this.state.contextItem.ValueScheme.pattern != undefined) ? this.state.value.pattern : ""} label="Enter pattern:" buttonAfter={<Button onClick={this.setPattern}>Use Pattern</Button>} />
            </TabPane>
          </TabbedArea>
        </div>
        <div className="modal-footer">
          <Button onClick={this.close}>Cancel</Button>
        </div>
      </Modal>
    );
  }
});

var ConceptRegistryModal = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      data: [
        {
            "definition": "Quantifying expression functioning as a determiner or pronoun. This category refers to plural elements that are of masculine gender.",
            "identifier": "QuantifyingDeterminerPlM",
            "name": "Quantifying determiner (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3596_a9f1a298-34f2-0ba1-cb5d-4871789e32f9",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Quantifying expression functioning as a determiner or pronoun. This category refers to singular elements that are of masculine gender.",
            "identifier": "QuantifyingDeterminerSgM",
            "name": "Quantifying determiner (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3594_9e51d835-ee60-b34b-f1ab-c7986678edb0",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Adjective that is specified for plural number and masculine gender.",
            "identifier": "AdjectivePlM",
            "name": "adjective (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3611_8d80f30b-e461-77a0-ca99-43593e5275ca",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Adjective that is specified for singular number and masculine gender.",
            "identifier": "AdjectiveSgM",
            "name": "adjective (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3609_0a501089-8b15-ccba-5bbd-f8f0aad975f3",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Indefinite article which is used for elements that are plural in number and of masculine gender.",
            "identifier": "IndefiniteArticlePlM",
            "name": "indefinite article (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3583_35d230a3-edc4-c086-3a72-cf857ef037a1",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Indefinite article which is used for elements that are singular in number and of masculine gender.",
            "identifier": "IndefiniteArticleSgM",
            "name": "indefinite article (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3585_62f83740-ae7c-cb24-7bd0-353457f57bbc",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of interrogative pronoun that is used to refer to plural referents that have masculine gender.",
            "identifier": "InterrogativePronounPlM",
            "name": "interrogative pronoun (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3631_9583b4fe-0bb2-8f97-b456-829fa26e57b4",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of interrogative pronoun that is used to refer to singular referents that have masculine gender.",
            "identifier": "InterrogativePronounSgM",
            "name": "interrogative pronoun (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3629_413ac66f-ac9e-f5a4-13a5-1d390a0f9b12",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of personal pronoun that is used to refer to singular referents that have masculine gender.",
            "identifier": "PersonalPronounSgM",
            "name": "personal pronoun (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3619_4d963b57-167a-2303-2338-278a2dff2d97",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of possessive pronoun that is used to refer to plural referents that have masculine gender.",
            "identifier": "PossessivePronounPlM",
            "name": "possessive pronoun (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3625_5a65af7e-289c-4843-c5a0-9e26cf5cc01b",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of possessive pronoun that is used to refer to singular referents that have masculine gender.",
            "identifier": "PossessivePronounSgM",
            "name": "possessive pronoun (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3623_31029fd9-6a65-0311-837f-42cea0b6e957",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of relative pronoun that is used to refer to plural referents that have masculine gender.",
            "identifier": "RelativePronounPlM",
            "name": "relative pronoun (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3637_02602ec3-5fc7-0b5f-97bd-c7b0063317d9",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Form of relative pronoun that is used to refer to singular referents that have masculine gender.",
            "identifier": "RelativePronounSgM",
            "name": "relative pronoun (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3635_db8b9ad0-2aa2-e33b-cfe5-62fea96ce669",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "form of pronoun which can only be combined with a word referring to a man (natural gender) (source: CGN)",
            "identifier": "person-3m",
            "name": "person 3m",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-5003_9bdea7b4-fddc-b62b-ffd3-217a8963e5e0",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Determiner expressing negative quantity of a plural and masculine element.",
            "identifier": "NegativeQuantifyingDeterminerPlM",
            "name": "negative quantifying determiner (pl,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3605_3220511e-6566-fdcb-1da1-67f89bf61a00",
            "type": "concept",
            "version": "1:0"
        },
        {
            "definition": "Determiner expressing negative quantity of a singular and masculine element.",
            "identifier": "NegativeQuantifyingDeterminerSgM",
            "name": "negative quantifying determiner (sg,m)",
            "owner": "CLARIN",
            "pid": "http://hdl.handle.net/11459/CCR_C-3603_03cc25dc-7f87-3896-0cfe-0dd2bb70d7f8",
            "type": "concept",
            "version": "1:0"
        }
      ],
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
  },
  confirm: function(evt) {
    var target = this.props.target;
    var selectedValue = (this.state.currentLinkSelection != null) ? this.state.data[this.state.currentLinkSelection].pid : "";

    if(target.refs.conceptRegInput != undefined)
      target.refs.conceptRegInput.props.onChange(selectedValue);
    else if(target.constructor.type === TypeModal)
      this.props.onClose(selectedValue)

    this.close();
  },
  close: function(evt) {
    this.props.onRequestHide();
  },
  componentDidUpdate: function(prevProps, prevState) {
    if(prevState.currentLinkSelection != this.state.currentLinkSelection) {
      var selectedClass = "selected";
      var tbody = $('#' + this.refs.table.getDOMNode().id + " tbody");
      tbody.children('.' + selectedClass).toggleClass(selectedClass);
      tbody.children().eq(this.state.currentLinkSelection).toggleClass(selectedClass);
    }

    this.props.onChange(this.getDOMNode());
  },
  componentWillMount: function() {
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
            value: (<span><a href={value} target="_blank">{value}</a></span>),
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
    this.props.onChange(this.getDOMNode());
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
  render: function() {
    var self = this;
    var tableClasses = classNames('table', 'table-bordered', 'table-hover', 'table-striped', 'table-condensed');

    var conceptRegHeader = {
      onClick: function(col) {
        sortColumn(self.state.columns, col, self.state.data, self.setState.bind(self));
      }
    };
    return (
      <Modal ref="modal" id="ccrModal" key="ccrModal" className="registry-dialog" title={this.props.title} backdrop={false} animation={false} onRequestHide={this.props.onRequestHide} container={this.props.container}>
        <div className='modal-body'>
          <Input type="text" placeholder="Type keyword and press Enter to search" valueLink={this.linkState('inputSearch')} addonBefore={<Glyphicon glyph='search' />} buttonAfter={<Button onClick={this.inputSearchUpdate}>Search</Button>}/>
          <Table id="ccrTable" ref="table" columns={this.state.columns} data={this.state.data} header={conceptRegHeader} className={tableClasses} />
        </div>
        <div className="modal-footer">
          <Button onClick={this.confirm} disabled={this.state.currentLinkSelection == null}>Ok</Button><Button onClick={this.close}>Cancel</Button>
        </div>
      </Modal>
    );
  }
});

var ModalTrigger = React.createClass({
  mixins: [OverlayMixin],
  getDefaultProps: function() {
    return {
      useLink: false
    }
  },
  getInitialState: function() {
    return {
      isModalOpen: false,
      position: {
        top: 0, left: 0
      },
      container: this.props.container,
      target: (this.props.target == undefined) ? this.props.container : this.props.target
    };
  },
  toggleModal: function(evt) {
      console.log('modal visible: ' + this.state.isModalOpen);
      var offset = $(this.state.container.getDOMNode()).position();

      console.log('toggle modal offset: ' + offset.top + " " + offset.left);
      this.setState({
        position: (!this.state.isModalOpen) ? update(this.state.position, { $set: offset }) : { top: 0, left: 0 },
        isModalOpen: !this.state.isModalOpen
      });
  },
  handleStart: function (event, ui) {
      console.log('Event: ', event);
      console.log('Position: ', ui.position);
  },
  handleDrag: function (event, ui) {
      console.log('Event: ', event);
      console.log('Position: ', ui.position);
      var offset = $(this.state.container.getDOMNode()).position();
      this.setState({
        position: update(this.state.position, { $set: { top: ui.position.top + offset.top, left: ui.position.left + offset.left }})
      });
  },
  handleStop: function (event, ui) {
      console.log('Event: ', event);
      console.log('Position: ', ui.position);
  },
  handleTableScroll: function(domNode) {
    var modal = domNode;
    var tableBody = $(modal).find('.table tbody').eq(0);
    var tableHead = $(modal).find('.table thead').eq(0);
    var scrollbarWidth = tableBody.innerWidth() - tableBody.prop('scrollWidth');
    if(tableBody.innerWidth() > tableBody.prop('scrollWidth'))
      tableHead.width(tableBody.innerWidth() - scrollbarWidth);
    else
      tableHead.width('100%');
  },
  componentDidUpdate: function() {
    var overlayNode = this.getOverlayDOMNode();
    if(overlayNode == undefined) overlayNode = "#"
    $(this.getOverlayDOMNode()).css({left: this.state.position.left, top: this.state.position.top, display: (this.state.isModalOpen) ? 'block' : 'none'});
  },
  componentDidMount: function() {
    console.log('container: ' + this.state.container);
  },
  getModal: function() {
    switch(this.props.type) {
      case "Type":
        return (<TypeModal {...this.props} target={this.state.target} onRequestHide={this.toggleModal} onChange={this.handleTableScroll}/>);
      break;
      case "ConceptRegistry":
        return (<ConceptRegistryModal {...this.props} target={this.state.target} onRequestHide={this.toggleModal} onChange={this.handleTableScroll} />);
      break;
      default:
        return null;
    };
  },
  render: function() {
    if(this.props.useLink)
      return (
        <a onClick={this.toggleModal}>{this.props.label}</a>
      )
    else
      return (
        <Button onClick={this.toggleModal}>
          {this.props.label}
        </Button>
      );
  },
  renderOverlay: function () {
    if(!this.state.isModalOpen)
      return <span/>;

    var modal = this.getModal();
    console.log('render overlay: ' + this.props.type);

    var target = this.state.target;
    console.log('target: ' + target);

    return (
      <Draggable axis="both" handle=".modal-header"
        grid={[5, 5]}
        zIndex={1050}
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        {modal}
      </Draggable>
    );
  }
});

module.exports = EditorDialog;
