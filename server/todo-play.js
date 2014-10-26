Goals = new Meteor.Collection("goals");
Habits = new Meteor.Collection("habits");
Dailies = new Meteor.Collection("dailies");
Todos = new Meteor.Collection("todos");

DaysStats = new Meteor.Collection("days_stats");
DoneTicker = new Meteor.Collection("done_ticker");

Meteor.publish('done_ticker', function () {
  return DoneTicker.find({}, {});
});

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


var default_allow = {
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    return (userId && doc.userId === userId);
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.userId === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.userId === userId;
  }, fetch: ['userId']
};

var default_deny = {
  update: function (userId, docs, fields, modifier) {
    // can't change userId
    return _.contains(fields, 'userId');
  },
  //remove: function (userId, doc) {
    // can't remove locked documents
    //return doc.locked;
  //},
  fetch: [] // no need to fetch 'userId'
};

Goals.allow(default_allow);
Habits.allow(default_allow);
Dailies.allow(default_allow);
Todos.allow(default_allow);

DaysStats.allow(default_allow);

Habits.deny(default_deny);
Dailies.deny(default_deny);
Todos.deny(default_deny);
Goals.deny(default_deny);

DaysStats.deny({
  update: function (userId, docs, fields, modifier) {
    // can't change userId
    return _.contains(fields, 'userId');
  },
  remove: function (userId, doc) {
    return true;
  },
  fetch: [] // no need to fetch 'userId'
});



// Code to select todos done for the ticker.

Meteor.setInterval( function () {
  candidates = Todos.find({done: true, private: false}, {sort: {ticktime: -1}, limit: 10});
  DoneTicker.remove({});

  candidates.forEach(function (todo) {
    userCfg = UserConfig.findOne({userId: todo.userId});
    if(!userCfg || !userCfg.display_name)
      userCfg = {display_name: "anon"};
    DoneTicker.insert({text: todo.text, display_name: userCfg.display_name});
  });
}, 60*5*1000 );
