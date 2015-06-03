// Write your package code here!
AdminData = new Mongo.Collection("admin-data");
admin_data = Meteor.subscribe("admin-data");


Template.admin.helpers({
  users: function () {
    if(admin_data.ready()) {
      return AdminData.find({});
    }
    return [];
  }
});
