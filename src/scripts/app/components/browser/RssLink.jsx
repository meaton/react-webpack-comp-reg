'use strict';
var React = require('react');

// Bootstrap
var Button = require('react-bootstrap/lib/Button');

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
    link: React.PropTypes.string.isRequired
  },
  render: function() {
    return (
      <div className="rssLink">
        <a href={this.props.link} title="RSS feed" target="_blank"><span>[RSS]</span></a>
      </div>
    )
  }
});

module.exports = RssLink;
