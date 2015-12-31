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
    onClickDownloadXml: React.PropTypes.func,
    onClickDownloadXsd: React.PropTypes.func
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

        {(this.props.onClickInfo != null || this.props.onClickDownloadXml != null || this.props.onClickDownloadXsd != null) && (
          <td className="infoLink">
            <Dropdown id={"options-"+this.props.data.id}>
              <a href="#" title="Options" bsRole="toggle" onClick={function(e){e.preventDefault();}}>
                <Glyphicon glyph="menu-down" />
              </a>
              <Dropdown.Menu className="dropdown-menu-right">
                {this.props.onClickInfo && <MenuItem onClick={this.props.onClickInfo.bind(null, this.props.data)}>Show info</MenuItem>}
                {this.props.onClickDownloadXml && <MenuItem>Download XML</MenuItem>}
                {this.props.onClickDownloadXsd && <MenuItem>Download XSD</MenuItem>}
              </Dropdown.Menu>
            </Dropdown>
          </td>
        )}
      </tr>
    )
  }
});

module.exports = DataTablesRow;
