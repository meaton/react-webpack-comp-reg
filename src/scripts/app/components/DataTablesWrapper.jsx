var React = require("react");

/**
* DataTablesWrapper - outputs a HTML static table layout and header coloums for rendering by the DataTables plugin.
* @constructor
*/
var DataTablesWrapper = React.createClass({
  componentDidMount: function() {
    var self = this;
    var id = this.getDOMNode().id;

    //TODO review resizing and height setting of datagrid scrollBody
     var resizeScrollBody = function() {
      var paddingBrowserDiv = $('.browser').innerHeight() - $('.browser').height();
      var newScrollBodyHeight = $('.main').outerHeight() - $('#' + id + '_wrapper').offset().top - $('.dataTables_scrollHead').outerHeight() - $('.dataTables_info').outerHeight() - $('.viewer').outerHeight() - paddingBrowserDiv;
      console.log('resizing dataTables scrollBody: ', newScrollBodyHeight, $('.browser').height());
      if(newScrollBodyHeight < 280) newScrollBodyHeight = 280;
      $('.dataTables_scrollBody').height(newScrollBodyHeight);
    };

    var resizeComponentViewer = function() {
      var newCompViewerHeight = $('.editor').innerHeight() - $('.ComponentViewer').offset().top + $('.btn-group').outerHeight() - $('.component-grid').outerHeight();
      console.log('resizing component viewer: ', newCompViewerHeight, $('.editor').outerHeight());
      if(newCompViewerHeight < 200) newCompViewerHeight = 200;
      $('.editor .ComponentViewer').height(newCompViewerHeight);
    };

  },

  render: function() {
    return (
      <table className="table table-striped" id="testtable">
        <thead>
          <tr>
            {(this.props.multiple || this.props.editMode) ? <td/> : null}
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
