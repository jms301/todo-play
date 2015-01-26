// Write your package code here!
AdminData = new Mongo.Collection("admin-data");
admin_data = Meteor.subscribe("admin-data");


Template.admin.helpers({
  users: function () {
    if(admin_data.ready()) {
      console.log(AdminData.find().fetch());
      return AdminData.find({});
    }
    return [];
  }
});
