var ee = require('events').EventEmitter;
var registryEvents = new ee();
var timeout = null;
var LoadingMixin = {
  setLoading: function(isLoading, eventEmitter) {
    if(eventEmitter == undefined)
      eventEmitter = (this.state.eventHolder) ? this.state.eventHolder : registryEvents;
    eventEmitter.emit('loading', isLoading);
  },
  componentWillMount: function() {
    //TODO: replace with Cursor React-component to received global events
    registryEvents.on('loading', function(progress, delay) {
      console.log('received loading event');
      if(delay == undefined) delay = 1000;
      if(progress) {
        clearTimeout(timeout);
        $('body').css('cursor', 'wait');
      } else {
        if(timeout != null) clearTimeout(timeout);
        timeout = setTimeout(function() {
          $('body').css('cursor', '');
        }, delay);
      }
    });

    this.setState({ eventHolder: registryEvents }, function(state) {
      state.eventHolder.emit('loading', true);
    });
  },
  componentDidMount: function() {
    //this.setLoading(false);
  },
  componentWillUpdate: function() {
    this.setLoading(true);
  },
  componentDidUpdate: function() {
    this.setLoading(false);
  }
};

module.exports = LoadingMixin;
