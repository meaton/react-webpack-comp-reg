'use strict';

var React = require("react");

//stylesheet - other options are available, see author's website for details
require('spinkit/scss/spinners/10-fading-circle.scss');

/**
* Spinner - Component based on spinkit, see <http://tobiasahlin.com/spinkit/>
* @constructor
*/
var Spinner = React.createClass({
  render: function() {
    return(
      <div className="spinner sk-fading-circle">
        <div className="sk-circle1 sk-circle"></div>
        <div className="sk-circle2 sk-circle"></div>
        <div className="sk-circle3 sk-circle"></div>
        <div className="sk-circle4 sk-circle"></div>
        <div className="sk-circle5 sk-circle"></div>
        <div className="sk-circle6 sk-circle"></div>
        <div className="sk-circle7 sk-circle"></div>
        <div className="sk-circle8 sk-circle"></div>
        <div className="sk-circle9 sk-circle"></div>
        <div className="sk-circle10 sk-circle"></div>
        <div className="sk-circle11 sk-circle"></div>
        <div className="sk-circle12 sk-circle"></div>
      </div>
    );
  }
});

module.exports = Spinner;
