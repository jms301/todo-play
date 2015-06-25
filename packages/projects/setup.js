Goals = new Meteor.Collection("goals");

Router.route('/projects', {
  data: function () {
    return (Meteor.user());
  }
});

