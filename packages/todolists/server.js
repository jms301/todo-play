Meteor.publish('habits', function () {
  return Habits.find({userId: this.userId} , {});
});

Meteor.publish('todos', function () {

  return Todos.find({userId: this.userId,
                      $or: [
                        {done: false},
                        {done: true, ticktime:
                          {$gt: new Date(new Date() - 172800000)}
                        }
                      ]
                    } , {});
});

Meteor.publish('dailies', function () {
  return Dailies.find({userId: this.userId} , {});
});

var default_allow = {
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    return (userId && doc.userId === userId);
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return (userId && doc.userId === userId);
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

Habits.allow(default_allow);
Dailies.allow(default_allow);
Todos.allow(default_allow);

Habits.deny(default_deny);
Dailies.deny(default_deny);
Todos.deny(default_deny);
