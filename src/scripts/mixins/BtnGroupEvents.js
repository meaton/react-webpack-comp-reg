var React = require('react');
var Config = require('../config').Config;
/**
* BtnGroupMixin - handlers for BtnMenuGroup
* @mixin
*/
var BtnGroupMixin = {
  getBtnGroupProps: function() {
    return {
      newComp: this.createNewAction,
      importNew: this.importNewAction,
      saveComp: this.saveAction,
      deleteComp: this.deleteAction,
      publishComp: this.publishAction,
      profile: this.state.profileId||this.state.profile,
      component: this.state.componentId||this.state.component,
      multiSelect: this.state.multiSelect,
      privateSelect: (this.state.filter == "private"),
      newActive: (this.isActive != undefined) ?
        this.isActive("newProfile") || this.isActive("newComponent") || this.isActive("newEditor") ||
        (this.isActive('component') && this.state.component == null) ||
        (this.isActive('profile') && this.state.profile == null)
        : false
    };
  },
  deleteAction: function() {
    //      - Handle for multiple select
    //      - Remove nodes selected for delete on confirm/200 OK resp.
    //      - Check first if selected items have any usage (REST)
    // TODO:
    //      - Expect a response from REST? 200, handle errors 40x
    //      - Display notice warning temp post-deletion
    var self = this;
    var selectedRows = $('#testtable tr.selected');

    var deleteProfile = function(profileId, cb) {
      self.refs.profile.deleteItem("profiles", profileId, function(resp) {
        console.log('delete response: ' + resp);
        if(cb != undefined) cb();
      });
    };

    var deleteComponent = function(componentId, cb) {
      self.refs.component.usageCheck(componentId, function(result) {
        if(result != null && result.profileDescription != undefined) {
          console.log('usage result: ' + JSON.stringify(result));
          console.warn('Error occurred: Component ' + componentId + ' is in use.');

          if(cb) cb({componentId: componentId, result: result.profileDescription});
        } else {
          self.refs.component.deleteItem("components", componentId, function(resp) {
            console.log('delete response: ' + resp);
            if(cb) cb();
          });
        }
      });
    };

    var deleteSelectedRows = function(cb) {
      if(selectedRows.length > 0) {
        var errors = [];
        var doNextRow = function(rowIdx) {
          if(rowIdx <= selectedRows.length-1) {
            var row = selectedRows.get(rowIdx);
            var id = $(row).data().reactid;
            id = (id != undefined && id.indexOf('clarin') > 0) ? id.substr(id.indexOf('$')+1, id.length).replace(/=1/g, '.').replace(/=2/g, ':') : null;

            if(id != null)
              cb(id, function(error) {
                  if(error) errors.push(error);
                  if(rowIdx == selectedRows.length-1) {
                    if(errors.length > 0) {
                      self.handleUsageErrors(errors);
                    } else {
                      self.refs.grid.removeSelected(true);
                    }
                  } else {
                    rowIdx += 1;
                    doNextRow(rowIdx);
                  }
              });
          }
        };

        doNextRow(0);
      }
    };

    this.refs.grid.setLoading(true);

    if(this.state.profileId != null && this.refs.profile != undefined && this.refs.profile.deleteItem != undefined)
      if(!this.state.multiSelect) deleteProfile(this.state.profileId, self.refs.grid.removeSelected.bind(self, true));
      else deleteSelectedRows(deleteProfile);
    else if(this.state.componentId != null && this.refs.component != undefined && this.refs.component.deleteItem != undefined)
      if(!this.state.multiSelect) deleteComponent(this.state.componentId, self.handleUsageErrors);
      else deleteSelectedRows(deleteComponent);
  },
  saveAction: function(update, ignoreUsage) {
    var self = this;
    if(update == undefined) update = true;

    console.log('save clicked');
    console.log('registry: ' + JSON.stringify(this.state.registry));
    //console.log('item: ' + JSON.stringify(this.state.profile||this.state.component));

    this.postFormAction(update, false, ignoreUsage);
  },
  publishAction: function(evt) {
    console.log('publish clicked: ' + evt.target);
    console.log('ref: ' + this.refs.editComponentForm);

    this.postFormAction(true, true);
  },
  postFormAction: function(update, publish, ignoreUsage) {
    var self = this;
    if(this.refs.grid.setLoading) this.refs.grid.setLoading(true);

    var queryParams = { filter: (publish) ? "published" : "private", type: (this.state.profile) ? "profiles" : "components" };
    if(this.state.profile != null && this.saveProfile != undefined)
      this.saveProfile(this.state.profile.Header.ID, update, publish, function(data) {
        console.log('returned 200 POST: ' + JSON.stringify(data));
        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.setState({ isSaved: true }, function() { self.transitionTo(Config.deploy.path, null, queryParams); }); // return route if no errors
      });
    else if(this.state.component != null && this.saveComponent != undefined)
      if(!publish && !ignoreUsage)
        this.usageCheck(this.state.component.Header.ID, function(result) {
          if(self.refs.grid.setLoading) self.refs.grid.setLoading(false);

          if(result != null && result.profileDescription != undefined) {
            console.log('usage result: ' + JSON.stringify(result));
            console.warn('Error occurred: Component ' + self.state.component.Header.ID + ' is in use.');

            self.handleUsageWarning([{componentId: self.state.component.Header.ID, result: result.profileDescription}],
              function(ignore) {
                self.postFormAction(update, publish, ignore);
              });
          } else {
            self.postFormAction(update, publish, true);
          }
        });
      else
        this.saveComponent(this.state.component.Header.ID, update, publish, function(data) {
          console.log('return 200 POST: ' + JSON.stringify(data));
          // check errors, display messages inline or show alert
          if(data != null)
            if(data.errors != undefined) self.showErrors(data.errors);
            else self.setState({ isSaved: true }, function() { self.transitionTo(Config.deploy.path, null, queryParams); }); // return route if no errors
        });

  },
  importNewAction: function(evt) { //TODO
    console.log('import new clicked: ' + evt.target);
  },
  closeAlert: function(elementId, evt) {
    if(evt) evt.stopPropagation();
    if(elementId) React.unmountComponentAtNode(document.getElementById(elementId));
    else console.error('Cannot unmount Alert dialog: ', elementId);
  },
  renderAlert: function(instance, elementId) {
    var div = React.DOM.div;
    if(instance && elementId) React.render(div({ className: 'static-modal' }, instance), document.getElementById(elementId));
    else console.error('Cannot render Alert dialog: ', elementId);
  },
  processUsageErrors: function(errors) {
    var self = this;
    var li = React.DOM.li;
    var errorsReactDOM = [];

    if(errors != undefined && !$.isArray(errors))
      errors = [errors];

    if(errors != undefined && errors.length > 0)
      for(var i=0; i < errors.length; i++)
        if(errors[i].result != undefined) {
          if(!$.isArray(errors[i].result))
            errors[i].result = [errors[i].result];
          for(var j=0; j < errors[i].result.length; j++) //TODO unique profile names referenced or show profiles used by each matched component
            errorsReactDOM.push(li({ key: errors[i].componentId + "_profile:" + errors[i].result[j].id }, errors[i].result[j].name));
        }

    return errorsReactDOM;
  },

};

module.exports = BtnGroupMixin;
