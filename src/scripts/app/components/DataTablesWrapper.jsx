var React = require("react");

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* DataTablesWrapper - outputs a HTML static table layout and header coloums for rendering by the DataTables plugin.
* @constructor
*/
var DataTablesWrapper = React.createClass({
  mixins: [ImmutableRenderMixin],

  render: function() {
    var className = "table table-striped";
    if(this.props.multiple) {
      className += " multipleSelection";
    }
    return (
      <table className={className} id="testtable">
        <thead>
          <tr>
            {(this.props.multiple || this.props.editMode) ? <th className="checkboxCell"/> : null}
            <th className="name">Name</th>
            <th>Group Name</th>
            <th>Domain Name</th>
            <th>Creator</th>
            <th>Description</th>
            <th>Registration Date</th>
            <th className="commentsCount">Comments</th>
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
