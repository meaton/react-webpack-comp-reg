var BrowserActions = require("./actions/BrowserActions.js")
    RestActions = require("./actions/RestActions.js");

module.exports = $.extend({}, BrowserActions, RestActions);
