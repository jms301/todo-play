Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('ItemLists');
});

Router.route('/config', {
  data: function () {
    return (UserConfig.findOne({userId: Meteor.userId()}) || DefaultUserConfig);
  }
});
