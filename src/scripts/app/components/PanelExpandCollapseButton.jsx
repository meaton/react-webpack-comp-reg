'use strict';

var log = require('loglevel');

var React = require("react");

var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

var PanelExpandCollapseButton = React.createClass({

  propTypes: {
    expandGlyph: React.PropTypes.string,
    collapseGlyph: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      expandGlyph: "chevron-up",
      collapseGlyph: "chevron-down"
    }
  },

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
          <Glyphicon glyph={expanded ? this.props.collapseGlyph : this.props.expandGlyph}/>
      </Button>
    );


  }
});

module.exports = PanelExpandCollapseButton;
