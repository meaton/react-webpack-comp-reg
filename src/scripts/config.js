/** @module General configuration for Component Registry REST service */
var Config = {
  cors: true,
  REST: {
    protocol: "http",
    host: 'localhost',
    port: '8080',
    path: '/ComponentRegistry',
    auth: { username: "seaton", password: "compreg" } //in case of CORS
  },
  deploy: {
    path: '/'
  }
}

function getUrl() {
  var url = (Config.REST.host != undefined && Config.REST.host.length > 0) ? Config.REST.protocol + "://" + Config.REST.host : "";
  url+= (Config.REST.port != undefined && Config.REST.port.length > 0 && url.length > 0) ? ":" + Config.REST.port + Config.REST.path : Config.REST.path;
  return url;
};

module.exports = {
  Config: Config,
  ccrUrl: getUrl() + "/ccr",
  restUrl: getUrl() + "/rest",
  adminUrl: getUrl() + "/admin",
  webappUrl: getUrl()
};
