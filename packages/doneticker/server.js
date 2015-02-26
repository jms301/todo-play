Meteor.publish('done_ticker', function () {
  return DoneTicker.find({}, {});
});


//No allow / deny since only the server is allowed to edit.

// Code to select todos done for the ticker.

Meteor.setInterval( function () {
  candidates = Todos.find({done: true, private: false}, {sort: {ticktime: -1}, limit: 10});
  DoneTicker.remove({});

  candidates.forEach(function (todo) {
    userCfg = Meteor.users.findOne(todo.userId);
    if(!userCfg || !userCfg.profile ||!userCfg.profile.display_name)
      userCfg = {profile:{display_name: "anon"}};
    DoneTicker.insert({text: todo.text, display_name: userCfg.profile.display_name});
  });
}, 60*5*1000 );



