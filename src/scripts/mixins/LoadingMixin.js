var ee = require('events').EventEmitter;

var registryEvents = new ee();
var timeout = null;

/*
* LoadingMixin - manages cursor state when some activity is occurring in the application.
* @mixin
*/
var LoadingMixin = {
  setLoading: function(isLoading) {
    var eventEmitter = (this.state.eventHolder) ? this.state.eventHolder : null;
    if(eventEmitter != null) eventEmitter.emit('loading', isLoading);
  },
  loadingHandler: function(progress, delay) {
    console.log('received loading event');

    if(delay == undefined) delay = 1000;
    if(progress) {
      clearTimeout(timeout);
      $('body').addClass('wait');
    } else {
      if(timeout != null) clearTimeout(timeout);
      timeout = setTimeout(function() {
        $('body').removeClass('wait');
      }, delay);
    }
  },
  componentWillMount: function() {
    //TODO: replace with Cursor React-component to received global events
    var eventEmitter = registryEvents.on('loading', this.loadingHandler);

    this.setState({ eventHolder: eventEmitter }, function(state) {
      state.eventHolder.emit('loading', true);
    });
  },
  componentDidMount: function() {
    //this.setLoading(false);
  },
  componentWillUnmount: function() {
    this.state.eventHolder.removeListener('loading', this.loadingHandler);
  },
  componentWillUpdate: function() {
    this.setLoading(true);
  },
  componentDidUpdate: function() {
    this.setLoading(false);
  }
};

module.exports = LoadingMixin;
