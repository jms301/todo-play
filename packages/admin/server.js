Meteor.publish("admin-data", function () {

  if(!this.userId)
    return [];
  if(!Meteor.users.findOne(this.userId))
    return [];

  if(Meteor.users.findOne(this.userId).super_user) {

    var self = this;
    var handles = []; // store the handles watching the tables.
    var admin_data = {}; // store the counts per user.
    var initializing = true;

    Meteor.users.find().forEach(function (user) {
      admin_data[user._id] = {
        email: user.emails.pop().address,
        todo: Todos.find({userId: user._id}).count(),
        daily: Dailies.find({userId: user._id}).count(),
        habit: Habits.find({userId: user._id}).count(),
        private_count: Todos.find({userId: user._id, private: true}).count(),
        undone_count: Todos.find({userId: user._id, done: false}).count(),
      };

      if(user.services.resume.loginTokens &&
         user.services.resume.loginTokens.length != 0) {
        admin_data[user._id].last_login =  user.services.resume.loginTokens.pop().when;
      }


      handles.push(Todos.find({userId: user._id}).observeChanges( {
        added: function (id, fields) {
          if (!initializing) {
            admin_data[user._id].todo++;

            if (fields.private)
              admin_data[user._id].private_count++;

            if (!fields.done)
              admin_data[user._id].undone_count++;

            self.changed("admin-data", user._id, admin_data[user._id]);
          }
        },
        changed: function(id, fields) {
          if (!initializing) {

            if (fields.private && fields.private == false)
              admin_data[user._id].private_count--;

            if (fields.private)
              admin_data[user._id].private_count++;

            if (fields.done)
              admin_data[user._id].undone_count--;

            if (fields.done && fields.done == false)
              admin_data[user._id].undone_count++;

            self.changed("admin-data", user._id, admin_data[user._id]);
          }
        } ,
        removed: function (id) {
          if(!initializing) {
            admin_data[user._id].todo--;
            self.changed("admin-data", user._id, admin_data[user._id]);
          }
        }
      }));


      self.added("admin-data", user._id, admin_data[user._id]);


    });

    initializing = false;
    self.ready();

    self.onStop(function () {
      _.forEach(handles, function (handle) {
          handle.stop();
      });

    });
  } else {
    return [] ;
  }
});

