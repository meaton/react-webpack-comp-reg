var React = require("react")
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

require('../../../styles/DataGrid.sass');

var DataGrid = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    items: React.PropTypes.array.isRequired,
    loading: React.PropTypes.bool.isRequired,
    onReload: React.PropTypes.func.isRequired,
    errorMessage: React.PropTypes.string
  },

  render: function() {
    return (
      <div>
        <div className={"grid" + (this.props.loading?" wait":"")} id="grid">
          {this.props.loading ? <span>Loading...</span> : null}
          {(this.props.errorMessage != null) ? <span className="error">{this.props.errorMessage}</span> : null}
          <ul>
            {
              this.props.items.map(function(item, i){
                return(
                  <li key={item.id}>
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
