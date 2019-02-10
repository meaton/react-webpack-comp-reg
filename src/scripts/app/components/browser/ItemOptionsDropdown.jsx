'use strict';
var log = require('loglevel');
var React = require('react');

var Constants = require("../../constants");

//bootstrap
var Button = require('react-bootstrap/lib/Button');
var Dropdown = require('react-bootstrap/lib/Dropdown');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/**
* ItemOptionsDropdown - table row menu for items
* @constructor
*/
var ItemOptionsDropdown = React.createClass({
    mixins: [ImmutableRenderMixin],

    propTypes: {
      item: React.PropTypes.object.isRequired,
      onClickInfo: React.PropTypes.func,
      onClickDownloadXml: React.PropTypes.func,
      onClickDownloadXsd: React.PropTypes.func,
    },

    render: function() {
      return (
        <Dropdown id={"options-"+this.props.item.id}>
          <a href="#" title="Options" bsRole="toggle" onClick={function(e){e.preventDefault();}} onContextMenu={function(e){e.preventDefault(); e.target.click();}}>
            <Glyphicon glyph="menu-down" />
          </a>
          <Dropdown.Menu className="dropdown-menu-right">
            {this.props.onClickInfo && <MenuItem onClick={this.props.onClickInfo.bind(null, this.props.item)}>Show info</MenuItem>}
            {this.props.onClickInfo && <MenuItem divider/>}
            {this.props.onClickDownloadXml && <MenuItem onClick={this.props.onClickDownloadXml.bind(null, this.props.item, Constants.CMD_VERSION_1_1)}>Download XML (CMDI 1.1)</MenuItem>}
            {this.props.onClickDownloadXml && <MenuItem onClick={this.props.onClickDownloadXml.bind(null, this.props.item, Constants.CMD_VERSION_1_2)}>Download XML (CMDI 1.2)</MenuItem>}
            {this.props.onClickDownloadXml && <MenuItem divider/>}
            {this.props.onClickDownloadXsd && <MenuItem onClick={this.props.onClickDownloadXsd.bind(null, this.props.item, Constants.CMD_VERSION_1_1)}>Download XSD (CMDI 1.1)</MenuItem>}
            {this.props.onClickDownloadXsd && <MenuItem onClick={this.props.onClickDownloadXsd.bind(null, this.props.item, Constants.CMD_VERSION_1_2)}>Download XSD (CMDI 1.2)</MenuItem>}
          </Dropdown.Menu>
        </Dropdown>
      );
    }
});

module.exports = ItemOptionsDropdown;
