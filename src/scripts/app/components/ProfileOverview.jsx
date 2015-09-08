'use strict';

var React = require("react"),
    Constants = require("../constants"),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

//components
var InfoPanel = require('./InfoPanel.jsx');

/**
* ProfileOverview - displays the loaded CMDI Profile, full schema and comments in Bootstrap tabbed-panes.
* @constructor
* @mixes Loader
* @mixes LoadingMixin
*/
var ProfileOverview = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ComponentSpecStore", "CommentsStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      spec: flux.store("ComponentSpecStore").getState(),
      comments: flux.store("CommentsStore").getState()
    };
  },

  propTypes: {
    item: React.PropTypes.object
  },

  //TODO: connect with registry item store (provides xml, comments)

  loadXml: function () {
    this.props.loadXml();
  },

  render: function() {
    var hideClass = (this.props.item != null) ? "show" : "hide";
    var infoPanel = (this.props.item != null) ?
      <InfoPanel  item={this.props.item}
                  load_data={this.loadXml}
                  xml_data={this.state.spec.xml}
                  comments_data={this.state.comments.comments}
                  commentsHandler={this.commentsHandler} />
      : null;
    return (
      <div className={hideClass}>
        {infoPanel}
      </div>
    );
  }

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
  // }
});

module.exports = ProfileOverview;
