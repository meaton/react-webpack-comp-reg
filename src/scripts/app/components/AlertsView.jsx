var log = require("loglevel");

var React = require("react"),
    Constants = require("../constants");

var Alert = require('react-bootstrap/lib/Alert');

// Mixins
var ImmutableRenderMixin = require('react-immutable-render-mixin');

/***
*
* @constructor
*/
var AlertsView = React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    messages: React.PropTypes.object.isRequired,
    onDismiss: React.PropTypes.func.isRequired
  },

  renderAlert: function(msgId, index) {
    var msg = this.props.messages[msgId];
    if(msg == undefined) {
      return null;
    }

    log.trace("Message", msgId, msg);

    // style depends on type
    var style;
    if(msg.type === 'error') {
      style = 'danger';
    } else {
      style = 'info';
    }

    return (<Alert key={msgId} bsStyle={style} onDismiss={this.props.onDismiss.bind(null, msgId)}>{msg.message}</Alert>);
  },

  render: function() {
    var messages = this.props.messages;
    var alerts = (messages == undefined || Object.keys(messages).length == 0) ? null : Object.keys(messages).map(this.renderAlert);
    return (
      <div id="alert-container">
        {alerts}
      </div>
    );
  }
});

module.exports = AlertsView;
