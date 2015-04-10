var BtnGroupMixin = {
  getBtnGroupProps: function() {
    return {
      newComp: this.createNewAction,
      editComp: this.editAction,
      importNew: this.importNewAction,
      saveComp: this.saveAction,
      saveNewComp: this.saveNewAction,
      publishComp: this.publishAction,
      cancelEdit: this.cancelAction,
      profile: this.state.profileId||this.state.profile,
      component: this.state.componentId||this.state.component,
      multiSelect: this.state.multiSelect,
      privateSelect: (this.state.filter == "private"),
      newActive: (this.isActive != undefined) ? this.isActive("newProfile") || this.isActive("newComponent") : false
    };
  },
  saveAction: function(evt) {
    var self = this;
    console.log('save clicked: ' + evt.target);
    console.log('registry: ' + JSON.stringify(this.state.registry));
    //console.log('item: ' + JSON.stringify(this.state.profile||this.state.component));

    if(this.state.profile != null && this.saveProfile != undefined)
      this.saveProfile(this.state.profile.Header.ID, false, function(data) {
        console.log('returned 200 POST: ' + JSON.stringify(data));
        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.transitionTo('/'); // return route if no errors
      });
    else if(this.state.component != null && this.saveProfile != undefined)
      this.saveComponent(this.state.component.Header.ID, false, function(data) {
        console.log('return 200 POST: ' + JSON.stringify(data));

        // check errors, display messages inline or show alert
        if(data != null)
          if(data.errors != undefined) self.showErrors(data.errors);
          else self.transitionTo('/'); // return route if no errors
      });
  },
  saveNewAction: function(evt) {
    console.log('save new clicked: ' + evt.target);
    console.log('ref: ' + this.refs.editComponentForm);
  },
  editAction: function(evt) {
    console.log('edit clicked: ' + evt.target);
  },
  publishAction: function(evt) {
    console.log('publish clicked: ' + evt.target);
    console.log('ref: ' + this.refs.editComponentForm);
  },
  cancelAction: function(evt) {
    console.log('cancel clicked: ' + evt.target);
  },
  createNewAction: function(evt) {
    console.log('create new clicked: ' + evt.target);
  },
  importNewAction: function(evt) {
    console.log('import new clicked: ' + evt.target);
  }
};

module.exports = BtnGroupMixin;
