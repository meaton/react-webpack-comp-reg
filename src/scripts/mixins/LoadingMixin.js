var ee = require('events').EventEmitter;

var registryEvents = new ee();
var timeout = null;

/**
* LoadingMixin - manages cursor state when some activity is occurring in the application.
* @mixin
*/
var LoadingMixin = {
  isLoading: function() {
    return (timeout != null && timeout != undefined);
  },
  setLoading: function(isLoading) {
    var eventEmitter = (this.state.eventHolder) ? this.state.eventHolder : null;
    if(eventEmitter != null) eventEmitter.emit('loading', isLoading);
    //console.log(this.constructor.displayName, 'event holder:', eventEmitter);
    //console.log(this.constructor.displayName, ' :: set loading: ', isLoading);
  },
  loadingHandler: function(progress, delay) {
    //console.log(this.constructor.displayName, ' :: received loading event: ', progress);
    var body = $('body');
    if(delay == undefined) delay = 200;
    if(progress) {
      clearTimeout(timeout);
      body.addClass('wait');
    } else {
      if(timeout != null) clearTimeout(timeout);
      timeout = setTimeout(function() {
        body.removeClass('wait');
      }, delay);
    }
  },
  componentWillMount: function() {
    //TODO: replace with Cursor React-component to received global events
    if(!this.isMounted()) {
      var eventEmitter = registryEvents.on('loading', this.loadingHandler);

      this.setState({ eventHolder: eventEmitter });
    }
  },
  componentDidMount: function() {
    //if(this.isMounted()) this.setLoading(false);
  },
  componentWillUnmount: function() {
    if(this.isMounted()) this.state.eventHolder.removeListener('loading', this.loadingHandler);
  },
  componentWillUpdate: function(nextState) {
    if(!this.eventHolder && nextState.eventHolder) nextState.eventHolder.emit('loading', true);
    else this.setLoading(true);
  },
  componentDidUpdate: function() {
    if(function(state) {
      state.eventHolder.emit('loading', true);
    })
    this.setLoading(false);
  }
};

module.exports = LoadingMixin;
