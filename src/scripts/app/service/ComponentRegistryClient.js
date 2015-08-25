var CompRegLoader = require('../../mixins/Loader');

var ComponentRegistryClient = {
  mixins: [CompRegLoader],

  loadComponents: function(success, failure) {
    failure("Client not implemented");
  }

};

module.exports = ComponentRegistryClient;
