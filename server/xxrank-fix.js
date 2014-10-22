Meteor.startup(function () { 
  Meteor.users.find({}).forEach( function (usr) {
    Todos.find({UserId: usr.id, done: false}, 
               {sort: ['rank', "desc"]}).forEach(
    function (item, index) { 
        Todos.update(item._id, {$set: {rank: index+1}});
    });

    Dailies.find({UserId: usr.id}, 
               {sort: ['rank', "desc"]}).forEach(
    function (item, index) { 
        Dailies.update(item._id, {$set: {rank: index+1}});
    });

    Habits.find({UserId: usr.id}, 
               {sort: ['rank', "desc"]}).forEach(
    function (item, index) { 
        Habits.update(item._id, {$set: {rank: index+1}});
    });
  });
});
