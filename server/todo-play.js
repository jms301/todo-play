/*
Goals = new Meteor.Collection("goals");
Habits = new Meteor.Collection("habits");
Dailies = new Meteor.Collection("dailies");
Todos = new Meteor.Collection("todos");
DaysStats = new Meteor.Collection("days_stats");
*/

Meteor.publish('days_stats', function () {
  return DaysStats.find({userId: this.userId} , {});
});
