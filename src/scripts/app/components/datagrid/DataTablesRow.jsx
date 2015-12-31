'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Dropdown = require('react-bootstrap/lib/Dropdown');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* DataTablesRow - manages the table-row selection state and display of the table-rows in the DataTablesGrid.
* @constructor
*/
var DataTablesRow = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    data: React.PropTypes.object.isRequired,
    selected: React.PropTypes.bool.isRequired,
    rowSelectAllowed: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    className: React.PropTypes.string,
    onClickInfo: React.PropTypes.func,
    onClickDownload: React.PropTypes.func
  },
  getDefaultProps: function() {
    return { buttonBefore: false, className: "unknown", rowSelectAllowed: true };
  },
  rowClick: function(val, evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.props.onClick(val, evt);
  },
  buttonClick: function(evt) {
    evt.stopPropagation();
    evt.currentTarget.blur();

    var rowId = this.props.data.id;
    this.rowClick(rowId, evt);
  },
  render: function(){
    var data = this.props.data;

    //TODO: parse registration date
    var registrationDate = data.registrationDate.substr(0,10);
    return (
      <tr onClick={this.props.buttonBefore ? null : this.rowClick.bind(this, this.props.data)} key={this.props.data.id} className={(this.props.selected) ? "selected " + this.props.className : this.props.className}>
        {this.props.buttonBefore && (
          <td className="add">
            <Button
              bsSize="xsmall"
              ref="addButton"
              title="Click to link this component to the seleceted component in the editor"
              onClick={this.buttonClick}
              disabled={!this.props.rowSelectAllowed}>+</Button>
          </td>
        )}

        <td className="name">{data.name}</td>
        <td className="groupName">{data.groupName}</td>
        <td className="domainName">{data.domainName}</td>
        <td className="creatorName">{data.creatorName}</td>
        <td className="description">{data.description}</td>
        <td className="registrationDate">{registrationDate}</td>
        <td className="commentsCount">{data.commentsCount}</td>

        {(this.props.onClickInfo != null || this.props.onClickDownload != null) && (
          <td className="infoLink">
            <Dropdown id={"options-"+this.props.data.id}>
              <Dropdown.Toggle bsSize="small">
                <Glyphicon glyph="star" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem eventKey="info">Get info</MenuItem>
                <MenuItem eventKey="xml">Download XML</MenuItem>
                <MenuItem eventKey="xsd">Download XSD</MenuItem>
              </Dropdown.Menu>
            </Dropdown>
            {
            // <a onClick={this.props.onClickInfo.bind(null, this.props.data)} title="Component details">
            //   <span className="glyphicon glyphicon-info-sign"></span>
            // </a>
            }
          </td>
        )}
      </tr>
    )
  }
});

module.exports = DataTablesRow;
