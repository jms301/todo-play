// Write your package code here!

Template.waitingon.helpers({
  days: function () {
      if(Session.get('active_project') === false)
      {
        todolist =  Todos.find({userId: Meteor.userId(),
                           hide_until: {$gt: new Date(Session.get("time_now"))}
                          },
                          {sort: ["hide_until", "desc"]}).fetch();
      } else {
        todolist = Todos.find({userId: Meteor.userId(),
                           project: Session.get('active_project'),
                           hide_until: {$gt: new Date(Session.get("time_now"))}
                          },
                          {sort: ["hide_until", "desc"]}).fetch();
      }

      //split the todolist array into an array of arrays for each date
      var sortedlist = [];

      while(todolist.length != 0) {
        var datePos = 1;
        for(i = 1; i < todolist.length; i++) {
          datePos = i;
          if (!moment(todolist[i].hide_until).isSame(
                      todolist[i-1].hide_until, 'day')) {
            break;
          }
        }

        sortedlist = sortedlist.concat([todolist.slice(0, datePos)]);
        todolist = todolist.slice(datePos,todolist.length);
      }

      return sortedlist;
  }
});

Template.waiting_time.helpers({
  format_date: function ()  {
    return moment(this[0].hide_until).format("YYYY/MM/DD");
  }
});
