Habits = new Meteor.Collection("habits");
Dailies = new Meteor.Collection("dailies");
Todos = new Meteor.Collection("todos");

Router.route('/', {
  template: 'ItemLists',
  waitOn: function(){
    //This code is a work around for ground db and login
    if (Meteor.users.find().count() && Meteor.isCordova) {
      //if we have a user record we have previously grounded the users data
      //so we can just return ready.
      return {
        ready:  function () { return true;},
        stop: function () { }
      };
    } else {
      //if we don't have a logged in user then we need to wait on collections.
      //
      return [Meteor.subscribe('todos'),
              Meteor.subscribe('habits'),
              Meteor.subscribe('dailies')];
    }
  }
});
