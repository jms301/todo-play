Router.route('/config', {
  data: function () {
    return (Meteor.user());
  }
});

