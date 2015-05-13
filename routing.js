Router.configure({
  layoutTemplate: 'ApplicationLayout',
  loadingTemplate: 'Loading',
  onBeforeAction: function () {
    if (!Meteor.user()) {
      this.render('TdpLogin');
    } else {
      this.next();
    }
  }
});
