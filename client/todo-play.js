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



// Hacks & Cludges:
// bootstrap 3 navbar fix
fix_top_padding = function () {

  //$('body').css({"padding-top": $(".navbar").height() + 30 + "px"});
};

//Body - body doesn't work veryw ell with iron router but layout does!
Template.ApplicationLayout.rendered = function () {
  $('#datepickerdiv').datepicker({
    format: "yyyy/mm/dd",
    startDate: "new Date()",
    todayBtn: true,
    todayHighlight: true
  });

  GAnalytics.pageview(); // google analytics
  fix_top_padding();
};

Template.ApplicationLayout.events({
  'click li#login-dropdown-list>a' : function (evt) {
      //auto focus the e-mail field when logging in.
      setTimeout(function () {
          $('#login-email').focus();
      }, 1);
    },
  'click button.hide-until': function (evt) {

    $("#until-modal").modal('hide');

    Todos.update($('#hide-until-id').val(), {$set: { hide_until:
      moment($('input#datepicker').val(), "YYYY/MM/DD").toDate()
      }});
  },
  'click' : function (evt)  {
    if (Session.get('edit_todo'))
      saveEdit(Session.get('edit_todo'), Todos);
    if (Session.get('edit_daily'))
      saveEdit(Session.get('edit_daily'), Dailies);
    if (Session.get('edit_habit'))
      saveHabit(Session.get('edit_habit'), Habits);
    Session.set('edit_todo', null);
    Session.set('edit_daily', null);
    Session.set('edit_habit', null);
  }
});

