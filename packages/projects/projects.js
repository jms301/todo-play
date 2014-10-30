Session.setDefault('active_project', false);

Goals = new Meteor.Collection("goals");

var goalHandle = Meteor.subscribe('goals', function () {

});

// template to provide select list for todolist items.
Template.project_select.helpers({
  is_selected: function (parentThis)  { 
    return (parentThis.project == this._id ? "selected" : "");
  },
  projects:  function () {
    return Goals.find({userId: Meteor.userId()});
  }
});

// Projects functions helpers
Template.projects.helpers({
  projects:  function () {
    return Goals.find({userId: Meteor.userId()});
  },
  active_project: function () {
    if(Session.get("active_project")) {
      return Goals.findOne({_id: Session.get("active_project")}).text;
    } else if(Session.get("active_project")===false) {
      return "All Projects";
    } else {
      return "Without Project";
    }
  }
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
    Session.set("active_project", false);
  },
  'click li.no-projects': function (evt) {
    Session.set("active_project", null);
  },
  'click input#add-project': function (evt) {
    stopProp(evt);
  }
});

Template.project.events({
  'click li.projects': function (evt) {
    Session.set("active_project", this._id);
  },
  'click span#remove' : function (evt) {
    if(confirm("sure you want to delete " + this.text + "?")) {
      Goals.remove(this._id);
      if(Session.get("active_project", this._id) == this._id)
        Session.set("active_project", null);
    }
  }

});

