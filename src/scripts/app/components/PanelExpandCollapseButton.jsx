'use strict';

var log = require('loglevel');

var React = require("react");

var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

var PanelExpandCollapseButton = React.createClass({
  render: function() {
    var {expanded, className, bsSize, ...otherProps} = this.props;
    if(className == null) {
      className = "panelExpansionToggler";
    } else {
      className = "panelExpansionToggler " + className;
    }
    if(bsSize == null) {
      bsSize = "small";
    }

    return(
      <Button
        className={className}
        bsSize={bsSize}
        {...otherProps}>
          <Glyphicon glyph={expanded ? "chevron-down" : "chevron-up"}/>
      </Button>
    );


  }
});

module.exports = PanelExpandCollapseButton;
