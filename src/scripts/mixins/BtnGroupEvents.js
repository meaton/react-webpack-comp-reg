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
    //TODO: - Handle for multiple select *done*
    //      - Expect a response from REST? 200, handle errors 40x
    //      - Display notice warning temp post-deletion
    //      - Remove nodes selected for delete on confirm/200 OK resp. *done*
    //      - Check first if selected items have any usage (REST)
    var self = this;
    var selectedRows = $('#testtable tr.selected');

    var deleteProfile = function(profileId, cb) {
      self.refs.profile.deleteItem("profiles", profileId, function(resp) {
        console.log('delete response: ' + resp);
        if(cb != undefined) cb();
      });
    };

    var deleteComponent = function(componentId, cb) {
      //TODO: usage check
      
      self.refs.component.deleteItem("components", componentId, function(resp) {
        console.log('delete response: ' + resp);
        if(cb != undefined) cb()
      });
    };

    var deleteSelectedRows = function(cb) {
      if(selectedRows.length > 0) {
        selectedRows.each(function(index, elem) {
          var id = $(this).data().reactid;
          id = (id != undefined && id.indexOf('clarin') > 0) ? id.substr(id.indexOf('$')+1, id.length).replace(/=1/g, '.').replace(/=2/g, ':') : null;

          var callback = (index == selectedRows.length-1) ? self.refs.grid.removeSelected : undefined;
          if(id != null)
            cb(id, callback);
        });
      }
    };

    if(this.state.profileId != null && this.refs.profile != undefined && this.refs.profile.deleteItem != undefined)
      if(!this.state.multiSelect) deleteProfile(this.state.profileId, self.refs.grid.removeSelected);
      else deleteSelectedRows(deleteProfile);
    else if(this.state.componentId != null && this.refs.component != undefined && this.refs.component.deleteItem != undefined)
      if(!this.state.multiSelect) deleteComponent(this.state.componentId, self.refs.grid.removeSelected);
      else deleteSelectedRows(deleteComponent);
  },
  saveAction: function(update) {
    var self = this;
    if(update == undefined) update = true;

    console.log('save clicked');
    console.log('registry: ' + JSON.stringify(this.state.registry));
    //console.log('item: ' + JSON.stringify(this.state.profile||this.state.component));

    this.postFormAction(update, false);
  },
  publishAction: function(evt) {
    console.log('publish clicked: ' + evt.target);
    console.log('ref: ' + this.refs.editComponentForm);

    this.postFormAction(true, true);
  },
  postFormAction: function(update, publish) {
    var self = this;
    var queryParams = { filter: (publish) ? "published" : "private", type: (this.state.profile) ? "profiles" : "components" };
    if(this.state.profile != null && this.saveProfile != undefined)
      this.saveProfile(this.state.profile.Header.ID, update, publish, function(data) {
        console.log('returned 200 POST: ' + JSON.stringify(data));
        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.setState({ isSaved: true }, function() { self.transitionTo('/', null, queryParams); }); // return route if no errors
      });
    else if(this.state.component != null && this.saveComponent != undefined)
      this.saveComponent(this.state.component.Header.ID, update, publish, function(data) {
        console.log('return 200 POST: ' + JSON.stringify(data));
        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.setState({ isSaved: true }, function() { self.transitionTo('/', null, queryParams); }); // return route if no errors
      });
  },
  importNewAction: function(evt) { //TODO
    console.log('import new clicked: ' + evt.target);
  }
};

module.exports = BtnGroupMixin;
