

Session.setDefault('active_project', null);

Goals = new Meteor.Collection("goals");

var goalHandle = Meteor.subscribe('goals', function () {

});

//templates
//Global project list for other templates
Template.registerHelper('projects', function(input) {
  return Goals.find({userId: Meteor.userId()});
});

Template.projects.helpers({
  projects:  function () {
    return Goals.find({userId: Meteor.userId()});
  },
  active_project: function () {
    if(Session.get("active_project")) {
      return Goals.findOne({_id: Session.get("active_project")}).text;
    } else 
      return "All Projects";
  },
});

Template.projects.events({
 'keydown #add-project, keyup #add-project, focusout #add-project': function (evt) {
    if(evt.type === 'keyup' && evt.which === 27) { //esc -> cancel
      //cancel
      evt.target.value='';
    }
    if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        Goals.insert({
          userId: Meteor.userId(),
          text: value
        });
        evt.target.value='';
      } else {
        //cancel
        evt.target.value='';
      }
    }
    stopProp(evt);
  },
  'click li.all-projects': function (evt) {
    Session.set("active_project", null);
  }, 
});

Template.project.helpers({ 
});

Template.project.events({
 'click li.projects': function (evt) {
    Session.set("active_project", this._id);
  }
});

