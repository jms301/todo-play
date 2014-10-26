UserConfig = new Meteor.Collection("user_config");

Router.route('/config', {
  data: function () {
    return (UserConfig.findOne({userId: Meteor.userId()}) || DefaultUserConfig);
  }
});

