Habits = new Meteor.Collection("habits");
Dailies = new Meteor.Collection("dailies");
Todos = new Meteor.Collection("todos");

Router.route('/', {
  template: 'ItemLists',
  waitOn: function(){
    return [Meteor.subscribe('todos'),
            Meteor.subscribe('dailies'),
            Meteor.subscribe('habits')];
  }
});
