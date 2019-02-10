'use strict';
var log = require('loglevel');

var React = require('react');


/**
* ConceptLinkInput - Text input with button to trigger CCR search
*
* @constructor
*/
var ConceptLinkInput = React.createClass({
  propTypes: {
    value: React.PropTypes.array.isRequired
  },

  render: function() {
    if(this.props.value == null) {
      return null;
    } else {
      return (<span className="attrValue">
        {
          this.props.value.map(function(doc, index) {
            if(doc == null) {
              return <span className="subValue" key={index} />;
            } else {
              return (
                <span className="subValue" key={index}>
                {doc['@lang'] && '['+doc['@lang'] +'] '}{doc['$']}
                </span>
              );
            }
          })
        }
      </span>)
    }
  }
});

module.exports = ConceptLinkInput;
