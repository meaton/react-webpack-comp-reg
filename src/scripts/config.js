/** @module General configuration for Component Registry REST service */
var Config =
  (typeof getComponentRegistryConfig == 'function' // function can provide external configuration
    && getComponentRegistryConfig() != null) ? getComponentRegistryConfig() : {
  //default config
  cors: true,
  REST: {
    url: "http://localhost:8080/ComponentRegistry",
    auth: { username: "user", password: "passwd" } //in case of CORS
  },
  deploy: {
    path: '/'
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
