//sessions
Session.setDefault('time_now', new Date().getTime());

// Hacks & Cludges:
// bootstrap 3 navbar fix
fix_top_padding = function () {

  $('body').css({"padding-top": $(".navbar").height() + 30 + "px"});
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

