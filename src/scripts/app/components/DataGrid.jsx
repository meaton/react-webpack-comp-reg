var React = require("react");

var DataGrid = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onReload: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>
        <div>
          <ul>
            {
              this.props.items.map(function(item, i){
                return(
                  <li>
                    <span>{item.name}</span>
                  </li>
                );
              })}
          </ul>
        </div>
        <a onClick={this.props.onReload}>reload</a>
      </div>
    )
  }
});

module.exports = DataGrid;
