'use strict';
var log = require('loglevel');
var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');

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
    disabled: React.PropTypes.bool,
    optionsMenu: React.PropTypes.object,
    domainMap: React.PropTypes.object
  },
  getDefaultProps: function() {
    return { buttonBefore: false, className: "unknown", rowSelectAllowed: true, disabled: false };
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

    var domain = this.props.domainMap[data.domainName];
    var domainName = (domain != null)? domain.label : data.domainName;

    return (
      <tr onClick={this.props.buttonBefore ? null : this.rowClick.bind(this, this.props.data)} key={this.props.data.id} className={(this.props.selected) ? "selected " + this.props.className : this.props.className}>
        {this.props.buttonBefore && (
          <td className="add">
            <Button
              bsSize="xsmall"
              ref="addButton"
              title="Click to link this component to the seleceted component in the editor"
              onClick={this.buttonClick}
              disabled={this.props.disabled || !this.props.rowSelectAllowed}>+</Button>
          </td>
        )}

        <td className="name">{data.name}</td>
        <td className="groupName">{data.groupName}</td>
        <td className="domainName">{domainName}</td>
        <td className="creatorName">{data.creatorName}</td>
        <td className="description" title={data.description}>{data.description}</td>
        <td className="registrationDate">{registrationDate}</td>
        <td className="commentsCount">{data.commentsCount}</td>

        {this.props.optionsMenu != null &&
          <td className="itemMenu">{this.props.optionsMenu}</td>
        }
      </tr>
    )
  }
});

module.exports = DataTablesRow;
