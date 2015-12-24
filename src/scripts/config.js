/** @module General configuration for Component Registry REST service */
var Config =
  (typeof getComponentRegistryConfig == 'function' // function can provide external configuration
    && getComponentRegistryConfig() != null) ? getComponentRegistryConfig() : {
  //default config
  //NOTE: changes here will only have effect if no configuration has been preloaded! (see index.html)
  "loglevel": "info",
  "cors": true,
  "REST": {
    "url": "http://localhost:8080/ComponentRegistry",
    "auth": {  //needed in case of CORS
      "username": "user",
      "password": "passwd"
    }
  },
  "deploy": {
    "path": '/'
  }
}

function getUrl() {
  return Config.REST.url;
};

module.exports = {
  Config: Config,
  ccrUrl: getUrl() + "/ccr",
  restUrl: getUrl() + "/rest",
  adminUrl: getUrl() + "/admin",
  webappUrl: getUrl()
};
