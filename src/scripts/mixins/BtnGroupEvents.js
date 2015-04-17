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
    //TODO: - Handle for multiple select
    //      - Expect a response from REST?
    //      - Display notice warning temp post-deletion
    //      - Remove nodes selected for delete on confirm/200 OK resp.
    var self = this;
    if(this.state.profileId != null && this.refs.profile != undefined && this.refs.profile.deleteItem != undefined)
      this.refs.profile.deleteItem("profiles", this.state.profileId, function(resp) {
        console.log('delete response: ' + resp);
        self.refs.grid.removeSelected();
      });
    else if(this.state.componentId != null && this.refs.component != undefined && this.refs.component.deleteItem != undefined)
      this.refs.component.deleteItem("components", this.state.componentId, function(resp) {
        console.log('delete response: ' + resp);
        self.refs.grid.removeSelected();
      });
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
    if(this.state.profile != null && this.saveProfile != undefined)
      this.saveProfile(this.state.profile.Header.ID, update, publish, function(data) {
        console.log('returned 200 POST: ' + JSON.stringify(data));
        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.transitionTo('/'); // return route if no errors
      });
    else if(this.state.component != null && this.saveComponent != undefined)
      this.saveComponent(this.state.component.Header.ID, update, publish, function(data) {
        console.log('return 200 POST: ' + JSON.stringify(data));

        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.transitionTo('/'); // return route if no errors
      });
  },
  createNewAction: function(evt) { //TODO
    console.log('create new clicked: ' + evt.target);
  },
  importNewAction: function(evt) { //TODO
    console.log('import new clicked: ' + evt.target);
  }
};

module.exports = BtnGroupMixin;
