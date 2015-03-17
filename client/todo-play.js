//sessions
Session.setDefault('time_now', new Date().getTime());

Session.setDefault("modal_template", 'blank');
Session.setDefault("modal_data", {});

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
  /*'click' : function (evt)  {
    if (Session.get('edit_todo'))
      saveEdit(Session.get('edit_todo'), Todos);
    if (Session.get('edit_daily'))
      saveEdit(Session.get('edit_daily'), Dailies);
    if (Session.get('edit_habit'))
      saveHabit(Session.get('edit_habit'), Habits);
    Session.set('edit_todo', null);
    Session.set('edit_daily', null);
    Session.set('edit_habit', null);
  }*/
});

