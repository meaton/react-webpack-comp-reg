'use strict';

var React = require('react');

//mixins
// var CompRegLoader = require('../mixins/Loader');
// var LoadingMixin = require('../mixins/LoadingMixin');

//components
var InfoPanel = require('./InfoPanel.jsx');

/**
* ProfileOverview - displays the loaded CMDI Profile, full schema and comments in Bootstrap tabbed-panes.
* @constructor
* @mixes Loader
* @mixes LoadingMixin
*/
var ProfileOverview = React.createClass({
  // mixins: [CompRegLoader, LoadingMixin],
  propTypes: {
    item: React.PropTypes.object,
    xml: React.PropTypes.object,
    comments: React.PropTypes.object,
    loadXml: React.PropTypes.func
  },

  // getInitialState: function() {
  //   return {
  //     profile: null,
  //     profile_xml: null,
  //     comments: null,
  //     visible: true
  //   };
  // },
  // loadProfileXml: function() {
  //   var self = this;
  //   this.setLoading(true);
  //   this.loadProfile(this.props.profileId, "text", function(data) {
  //       self.setState({profile_xml: data, visible: true});
  //   });
  // },
  // reloadComments: function() {
  //   var self = this;
  //   this.loadComments(this.props.profileId, false, function(comments) {
  //     self.setState({comments: comments});
  //   });
  // },
  // commentsHandler: function() {
  //   var self = this;
  //   return {
  //     save: function(comment) {
  //       self.saveComment(comment, self.props.profileId, null, function(id) {
  //         console.log('comment saved: ', id);
  //         self.reloadComments();
  //       });
  //     },
  //     delete: function(commentId) {
  //       self.deleteComment(commentId, self.props.profileId, null, function(resp) {
  //         console.log(resp);
  //         self.reloadComments();
  //       });
  //     }
  //   };
  // },
  // componentWillReceiveProps: function(nextProps) {
  //   console.log(this.constructor.displayName, 'received profile props:', JSON.stringify(nextProps));
  //   console.log('profileId: ' + this.props.profileId);
  //   var self = this;
  //   if(nextProps.profileId != null && (nextProps.profileId != this.props.profileId)) {
  //       this.setState({profile: null, comments: null, profile_xml: null }, function() {
  //         self.setLoading(true);
  //
  //         self.loadProfile(nextProps.profileId, "json", function(data) {
  //           self.setState({profile: data, visible: true});
  //         });
  //
  //         self.loadComments(nextProps.profileId, true, function(comments) {
  //           self.setState({comments: comments});
  //         });
  //       });
  //   } else if(nextProps.profileId == null)
  //     this.setState({visible: false});
  // },
  // componentDidMount: function() {
  //   var self = this;
  //   if(this.props.profileId) {
  //     this.setLoading(true);
  //
  //     this.loadProfile(this.props.profileId, "json", function(data) {
  //       self.setState({profile: data, visible: true});
  //     });
  //
  //     this.loadComments(this.props.profileId, true, function(comments) {
  //       self.setState({comments: comments});
  //     });
  //   }
  // },
  loadXml: function () {
    this.props.loadXml();
  },

  render: function() {
    var hideClass = (this.props.item != null) ? "show" : "hide";
    var infoPanel = (this.props.item != null) ?
      <InfoPanel  item={this.props.item}
                  load_data={this.loadXml}
                  xml_data={this.props.xml}
                  comments_data={this.props.comments}
                  commentsHandler={this.commentsHandler} />
      : null;
    return (
      <div className={hideClass}>
        {infoPanel}
      </div>
    );
  }
});

module.exports = ProfileOverview;
