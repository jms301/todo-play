var configHandle = Meteor.subscribe('user_config', function () {

});

Template.config.events({
  'click button#cancel': function (evt, template) {
    template.$('#day_end').val(this.day_end);
    template.$('#display_name').val(this.display_name);
    template.$('#red_age').val(this.red_age);
    Router.go('/');
  },
  'click button#save': function (evt, template) {
    Meteor.users.update(Meteor.userId(),
                        {$set:
                          {"profile.red_age" : template.$('#red_age').val(),
                           "profile.day_end" : template.$('#day_end').val(),
                           "profile.display_name" :
                                template.$('#display_name').val()}
                         });

    Router.go('/');
  }
});

