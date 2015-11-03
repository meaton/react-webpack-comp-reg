var log = require("loglevel");

var Fluxxor = require("fluxxor"),
    Constants = require("../constants"),
    React = require('react/addons');

var update = React.addons.update;

/**
 * adds a new message to a messages structure
 * @param  {[type]} messages object to add to
 * @param  {[type]} type     type of message
 * @param  {[type]} obj      message object
 * @return {[type]}          new object with added message
 */
function newMessage(messages, type, obj) {
  // extract message from object
  var message;
  if(typeof obj == 'object') {
    if(obj.hasOwnProperty('message')) {
      message = obj.message;
    } else {
      message = JSON.stringify(obj);
    }
  } else  { //if(typeof obj == 'string')
    message = obj;
  }

  // assign unique id
  var id = null;
  var count=0;
  while(id == null || messages.hasOwnProperty(id)) {
    id = type + count++;
  }

  var newMsg = {
    type: type,
    message: message
  }

  return update(messages, {[id]: {$set: newMsg}});
}

var MessageStore = Fluxxor.createStore({
  initialize: function(options) {
    this.messages = {
      //msg1: {type: 'message', message: 'this is a test message'},
      //err1: {type: 'error', message: 'this is a test error'}
    };

    this.bindActions(
      Constants.DISMISS_MESSAGE, this.handleDismiss,
      Constants.LOAD_ITEMS_FAILURE, this.handleError,
      Constants.LOAD_ITEM_FAILURE, this.handleError,
      Constants.LOAD_COMPONENT_SPEC_FAILURE, this.handleError,
      Constants.DELETE_COMPONENTS_FAILURE, this.handleError,
      Constants.SAVE_COMPONENT_SPEC_FAILURE, this.handleError
    );
  },

  getState: function() {
    return {
      messages: this.messages
    };
  },

  handleError: function(message) {
    // update messages object
    this.messages = newMessage(this.messages, 'error', message);
    this.emit("change");
  },

  handleDismiss(msgId) {
    if(this.messages.hasOwnProperty(msgId)) {
      //copy all messages to new object except one with msgId
      //TODO: nicer way of removing one property in immutable way?
      var newMessages = {};
      var currentIds = Object.keys(this.messages);
      for(var i=0;i<currentIds.length;i++) {
        var id = currentIds[i];
        if(msgId !== id) {
          newMessages[id] = this.messages[id];
        }
      }
      this.messages = newMessages;

      log.trace("Messages after removal of", msgId, this.messages);
      this.emit("change");
    }
  }

});

module.exports = MessageStore;
