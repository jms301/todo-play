Meteor.publish('user_config', function () {
  return UserConfig.find({userId: this.userId} , {});
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

UserConfig.allow(default_allow);
UserConfig.deny(default_deny);

// tempory script to fix replicate userconfig into user.profile

Meteor.startup(function () {
  Meteor.users.find({}).forEach ( function(usr) {
    conf = UserConfig.findOne({userId: usr._id});
    if(conf) {
      Meteor.users.update(usr._id, {$set:
                          {profile: { display_name: conf.display_name,
                                      day_end: conf.day_end,
                                      red_age: conf.red_age}}
                                  });
      console.log(Meteor.users.findOne(usr._id).profile);
    }
  });
});
