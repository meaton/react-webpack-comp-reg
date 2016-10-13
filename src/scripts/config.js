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
  var trailingSlashPattern = /^(.*)(\/)$/;
  if(trailingSlashPattern.test(Config.REST.url)) {
    //remove the trailing slash
    return Config.REST.url.replace(trailingSlashPattern, "$1");
  } else {
    return Config.REST.url;
  }
};

module.exports = {
  Config: Config,
  ccrUrl: getUrl() + "/ccr",
  vocabulariesUrl: getUrl() + "/vocabulary/conceptscheme",
  restUrl: getUrl() + "/rest",
  adminUrl: getUrl() + "/admin",
  webappUrl: getUrl()
};
