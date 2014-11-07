// Write your package code here!

Template.waitingon.helpers({
  todos: function () {
      if(Session.get('active_project') === false)
      {
        return Todos.find({userId: Meteor.userId(),
                           done: false,
                           hide_until: {$gt: new Date(Session.get("time_now"))}
                          },
                          {sort: ["hide_until", "desc"]});
      } else {
        return Todos.find({userId: Meteor.userId(),
                           project: Session.get('active_project'),
                           done: false,
                           hide_until: {$gt: new Date(Session.get("time_now"))}
                          },
                          {sort: ["hide_until", "desc"]});
      }
  },
  pretty_date: function (date) { 
    return moment(date).format("DD/MM/YYYY");
  } 
});
