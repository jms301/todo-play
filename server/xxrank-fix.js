Meteor.startup(function () {
  Meteor.users.find({}).forEach( function (usr) {
    Todos.find({UserId: usr.id}, 
               {sort: ['rank', "desc"]}).forEach(
    function (item, index) { 
        Todos.update(item._id, {$set: {rank: index+1}});

        if(item.project===null)
          Todos.update(item._id, {$set: {project: ""}});
    });

    Dailies.find({UserId: usr.id}, 
               {sort: ['rank', "desc"]}).forEach(
    function (item, index) { 
        Dailies.update(item._id, {$set: {rank: index+1}});
        if(item.project===null)
          Dailies.update(item._id, {$set: {project: ""}});
    });

    Habits.find({UserId: usr.id}, 
               {sort: ['rank', "desc"]}).forEach(
    function (item, index) { 
        Habits.update(item._id, {$set: {rank: index+1}});

        if(item.project===null)
          Habits.update(item._id, {$set: {project: ""}});
    });
  });
});
