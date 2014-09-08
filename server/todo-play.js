/*
Goals = new Meteor.Collection("goals");
Habits = new Meteor.Collection("habits");
Dailies = new Meteor.Collection("dailies");
Todos = new Meteor.Collection("todos");
DaysStats = new Meteor.Collection("days_stats");

//user config stuff
Config = new Meteor.Collection("config");

*/

Meteor.publish('days_stats', function () {
  return DaysStats.find({userId: this.userId} , {});
});

Meteor.publish('habits', function () {
  return Habits.find({userId: this.userId} , {});
});

Meteor.publish('todos', function () {
  return Todos.find({userId: this.userId} , {});
});

Meteor.publish('dailies', function () {
  return Dailies.find({userId: this.userId} , {});
});

Meteor.publish('goals', function () {
  return Goals.find({userId: this.userId} , {});
});

Meteor.publish('user_config', function () {
  return UserConfig.find({userId: this.userId} , {});
});
