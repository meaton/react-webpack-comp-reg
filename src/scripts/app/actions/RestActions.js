var Constants = require("../constants"),
    /* mock */
    // ComponentRegistryClient = require("./service/ComponentRegistryMockClient")
    /* REST client */
    ComponentRegistryClient = require("../service/ComponentRegistryClient")

module.exports = {
  loadItems: function(type, space) {
    this.dispatch(Constants.LOAD_ITEMS);
    ComponentRegistryClient.loadComponents(type, space, function(items){
        // success
        this.dispatch(Constants.LOAD_ITEMS_SUCCESS, items);
      }.bind(this),
      function(message) {
        // failure
        this.dispatch(Constants.LOAD_ITEMS_FAILURE, message);
      }.bind(this)
    );
  },

  loadComponentSpec: function(type, space, item) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);
    ComponentRegistryClient.loadSpec(type, space, item.id, "json", function(spec){
        // success

        //TODO: augment spec with IDs?

        this.dispatch(Constants.LOAD_COMPONENT_SPEC_SUCCES, spec);
      }.bind(this),
      function(message) {
        // failure
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_FAILURE, message);
      }.bind(this)
    );
  },

  loadComponentSpecXml: function(type, space, item) {
    this.dispatch(Constants.LOAD_COMPONENT_SPEC);
    ComponentRegistryClient.loadSpec(type, space, item.id, "text", function(specXml){
        // success
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_XML_SUCCES, specXml);
      }.bind(this),
      function(message) {
        // failure
        this.dispatch(Constants.LOAD_COMPONENT_SPEC_FAILURE, message);
      }.bind(this)
    );
  }

};
