'use strict';

var React = require('react');

//bootstrap
var Button = require('react-bootstrap/lib/Button');
//router
var History = require("react-router").History;

/**
* LinkButton
* @constructor
*/
var LinkButton = React.createClass({
  mixins: [History],
  navigate: function() {
    this.history.pushState(null, this.props.to);
  },
  render: function() {
    var {to, onClick, ...other} = this.props;
    return (
      <Button onClick={this.navigate} {...other}>
        {this.props.children}
      </Button>
    );
  }
});

module.exports = LinkButton;
