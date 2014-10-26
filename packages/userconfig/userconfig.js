var configHandle = Meteor.subscribe('user_config', function () {

});

DefaultUserConfig = {
  userId: Meteor.userId(),
  day_end: 0,
  red_age: 30,
  display_name: "Anon"
};

Template.config.events({
  'click button#cancel': function (evt, template) {
    template.$('#day_end').val(this.day_end);
    template.$('#display_name').val(this.display_name);
    template.$('#red_age').val(this.red_age);
    Router.go('/');
  },
  'click button#save': function (evt, template) {
    to_save = UserConfig.findOne({userId: Meteor.userId()});
    if (to_save) {
      UserConfig.update(to_save._id, 
                          {$set:
                             { red_age: template.$('#red_age').val(),
                               day_end: template.$('#day_end').val(),
                               display_name: template.$('#display_name').val()}
                          });


    } else {
      UserConfig.insert(
                      {
                        userId: Meteor.userId(),
                        red_age: template.$('#red_age').val(),
                        day_end: template.$('#day_end').val(),
                        display_name: template.$('#display_name').val()
                      });

    }

    Router.go('/');
  }
});

Template.config.rendered = function () {  
   $('body').css({"padding-top": $(".navbar").height() + 30 + "px"});
};

