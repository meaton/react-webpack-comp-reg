'use strict';
var log = require('loglevel');
var React = require('react');

var ComponentRegistryClient = require('../../service/ComponentRegistryClient');

// Bootstrap
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Button');

//mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

require('../../../../styles/RssLink.sass');

/**
* RssLink
* @constructor
*/
var RssLink = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    type: React.PropTypes.string.isRequired,
    space: React.PropTypes.string.isRequired,
    team: React.PropTypes.string
  },
  render: function() {
    var rssLink = ComponentRegistryClient.getRegistryUrl(this.props.type) + "/rss";
    //TODO: private/team space
    return (
      <div className="rssLink">
        <Button href={rssLink} title="RSS feed" target="_blank"><span className="glyphicon">&nbsp;</span></Button>
      </div>
    )
  }
});

module.exports = RssLink;
