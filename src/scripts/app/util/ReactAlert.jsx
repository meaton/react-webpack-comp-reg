'use strict';

var React = require('react/addons');
var update = React.addons.update;

module.exports = {

  renderAlert: function(instance, elementId) {
    var div = React.DOM.div;
    if(instance && elementId)
      React.render(div({ className: 'static-modal' }, instance), document.getElementById(elementId));
    else
      log.error('Cannot render Alert dialog: ', elementId);
  },

  closeAlert: function(elementId, evt) {
    if(evt) evt.stopPropagation();
    if(elementId)
      React.unmountComponentAtNode(document.getElementById(elementId));
    else
      log.error('Cannot unmount Alert dialog: ', elementId);
  }
}
