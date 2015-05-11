//sessions
Session.setDefault('time_now', new Date().getTime());

Session.setDefault("modal_template", 'blank');
Session.setDefault("modal_data", {});


Template.Loading.helpers({
  isCordova: function () {
    return Meteor.isCordova;
  }
});

Template.modal.helpers({
  modalTemplate: function () {
    return Session.get('modal_template');
  },
  modalData: function () {
    return Session.get('modal_data');
  }
});

Template.modal.rendered = function () {
  $('#site-modal').on('hidden.bs.modal', function (e) {
    Session.set("modal_template", 'blank');
    Session.set("modal_data", {});

  });

};

// Hacks & Cludges:

//Body - body doesn't work veryw ell with iron router but layout does!
Template.ApplicationLayout.rendered = function () {
  GAnalytics.pageview(); // google analytics
};

Template.ApplicationLayout.events({
  'click li#login-dropdown-list>a' : function (evt) {
    //auto focus the e-mail field when logging in.
    setTimeout(function () { $('#login-email').focus(); }, 1);
  },
});

