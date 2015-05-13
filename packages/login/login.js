Session.setDefault("tdp_notify", "");

Template.TdpLogin.helpers({
  notify: function () {
    return Session.get("tdp_notify");
  }
});

Template.TdpLogin.events({
  'submit #login-form' : function(evt, temp){
    evt.preventDefault();
    // retrieve the input field values
    email = temp.$('input#login-email').val();
    password = temp.$('input#login-password').val();
    Meteor.loginWithPassword(email, password, function(err){
      if (err)
        Session.set("tdp_notify", err.reason);
    });
    return false;
  },

  'submit #create-form' : function(evt, temp){

    email = temp.$('input#create-email').val();
    password = temp.$('input#create-password').val();

    // Trim and validate the input
    Accounts.createUser({email: email, password : password}, function(err){
      if (err)
        Session.set("tdp_notify", err.reason)

    });

      return false;

    return false;
  },

  'submit #reset-pass-form' : function(evt, temp){

    email = temp.$('input#reset-email').val();

    Accounts.forgotPassword({email: email}, function(err) {
      if (err) {
        if (err.message === 'User not found [403]') {
          Session.set("tdp_notify", err.reason);
        } else {
          Session.set("tdp_notify", err.reason);
        }
      } else {
          Session.set("tdp_notify", "E-mail sent, check your inbox");
      }
    });

    return false;
  },

  'click input#tdp_cancel-create' : function(evt, temp){
    Session.set("tdp_notify", "");
    temp.$('div#tdp_login').removeClass("hidden");
    temp.$('div#tdp_create').addClass("hidden");
  },
  'click a#tdp_create-acc' : function(evt, temp) {
    Session.set("tdp_notify", "");
    temp.$('div#tdp_create').removeClass("hidden");
    temp.$('div#tdp_login').addClass("hidden");
  },
  'click input#tdp_cancel-reset' : function(evt, temp){
    Session.set("tdp_notify", "");
    temp.$('div#tdp_login').removeClass("hidden");
    temp.$('div#tdp_reset').addClass("hidden");
  },
  'click a#tdp_reset-pass' : function(evt, temp) {
    Session.set("tdp_notify", "");
    temp.$('div#tdp_reset').removeClass("hidden");
    temp.$('div#tdp_login').addClass("hidden");
  }
});
