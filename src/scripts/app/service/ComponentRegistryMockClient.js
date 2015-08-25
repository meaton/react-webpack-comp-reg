/* Mock client */
var ComponentRegistryClient = {

  loadComponents: function(success, failure) {
    setTimeout(function() {
      var items = [
        {
          id: 1,
          name: "First item"
        },
        {
          id: 2,
          name: "Second item"
        }
      ]
      success(items);
      //failure("Could not connect to server")
    }, 500);
  }

};

module.exports = ComponentRegistryClient;
