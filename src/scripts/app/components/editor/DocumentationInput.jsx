'use strict';
var log = require('loglevel');

var React = require('react');

//bootstrap
var Input = require('react-bootstrap/lib/Input');


/**
* ConceptLinkInput - Text input with button to trigger CCR search
*
* @constructor
*/
var ConceptLinkInput = React.createClass({
  propTypes: {
    value: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render: function() {
    //TODO: Add language selector
    var {value, onChange, ...other} = this.props;
    if($.isArray(value) && value.length > 0) {
      return (
      <div>
      {
        value.map(function(doc) {
          return <Input type="text" value={doc['$']} {...other} /> //TODO: onchange
        })
      }
      </div>);
    } else {
      return <Input type="text" value="" {...other} /> //TODO: onchange
    }
  }
});

module.exports = ConceptLinkInput;
