var React = require("react");
var Constants = require("../../constants");
// mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

// utils
var classNames = require('classnames');

/**
* DataTablesWrapper - outputs a HTML static table layout and header coloums for rendering by the DataTables plugin.
* @constructor
*/
var DataTablesWrapper = React.createClass({
  mixins: [ImmutableRenderMixin],

  createHeaderProps: function(column) {
    var isSortColumn = this.props.sortState != null && this.props.sortState.column === column;

    var toggleProps = {
      className: classNames(column, {
        sortable: this.props.onToggleSort != null,
        asc:  isSortColumn && this.props.sortState.order === Constants.SORT_ORDER_ASC,
        desc: isSortColumn && this.props.sortState.order === Constants.SORT_ORDER_DESC,
      })
    };

    if(this.props.onToggleSort) {
      toggleProps.onClick = this.props.onToggleSort.bind(null, column);
    }
    return toggleProps;
  },

  render: function() {
    var className = classNames("table table-striped", {
      multipleSelection: (this.props.multiple),
      withInfoLink: (this.props.onClickInfo != null)
    });

    return (
      <table className={className} id="testtable">
        <thead>
          <tr>
            {(this.props.multiple || this.props.editMode) && <th className="checkboxCell"/> }
            <th {...this.createHeaderProps('name')}>Name</th>
            <th {...this.createHeaderProps('groupName')}>Group Name</th>
            <th {...this.createHeaderProps('domainName')}>Domain Name</th>
            <th {...this.createHeaderProps('creatorName')}>Creator</th>
            <th {...this.createHeaderProps('description')}>Description</th>
            <th {...this.createHeaderProps('registrationDate')}>Registration Date</th>
            <th {...this.createHeaderProps('commentsCount')}>Comments</th>
            {this.props.onClickInfo && <th className="infoLink"/>}
          </tr>
        </thead>
        <tbody>
          {this.props.children}
        </tbody>
      </table>
    );
  }
});

module.exports = DataTablesWrapper;
