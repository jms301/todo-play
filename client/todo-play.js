Session.setDefault('edit_todo', null);
Session.setDefault('edit_daily', null);
Session.setDefault('edit_habit', null);

Session.setDefault('today', null);
Session.setDefault('days_stats_today', null);
Session.setDefault('days_stats_yesterday', null);
Session.setDefault('days_stats_before', null);

Session.setDefault('active_goal', null);
/*
Meteor.startup(function() {
  Deps.autorun(function() {
    if(Meteor.userId() && DaysStats.ready()) {
      Meteor.setInterval(setupDaysStats, 10000);
    }
  });
});
*/
// bootstrap 3 navbar fix
$(window).on('load resize', function() {
      $('body').css({"padding-top": $(".navbar").height() + 30 + "px"});
});
/*
var setupDaysStats = function () {
  if (Session.get('today') ===
    moment().startOf('day').add(12, 'hours').toString()) {
    // already setup the date to today keep on trucking
  } else {

    date =  moment().startOf('day').add(12, 'hours');
    Session.set('days_stats_today', findOrCreateDaysStats(date)._id);

    Session.set('today', date.toString());
    yesterdays_stats = DaysStats.findOne({date: date.toDate(),
                                          userId: Meteor.userId()});
    if(yesterdays_stats)
      Session.set('days_stats_yesterday', yesterdays_stats._id);

    date.subtract(1, 'day');

    befores_stats = DaysStats.findOne({date: date.toDate(),
                                       userId: Meteor.userId()});
    if(befores_stats)
      Session.set('days_stats_before', befores_stats._id);

  }
};

findOrCreateDaysStats = function (date) {
  day = DaysStats.findOne({date: date.toDate()});
  console.log("testing Day:");
  console.log(date.format("MM dd"));
  console.log(day);
  console.log(!day);
  if( !day ) {
    day = DaysStats.insert({date: date.toDate(),
                            userId: Meteor.userId(),
                            habits: 0,
                            dailies: 0,
                            todos: 0});

    day = DaysStats.findOne({_id: day, userId: Meteor.userId()});
  }

  return day;
};
*/

var clearSelect = function() {
  if (window.getSelection) {
    if (window.getSelection().empty) {  // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {  // IE?
    document.selection.empty();
  }
};

var cancelEdit = function (id, List) {
  if(id) {
    title_input = $('#item-title-' + id);
    notes_input = $('#item-notes-' + id);
    goal_input  = $('#item-goals-' + id);

    item = List.findOne({_id: id});
    title_input.val(item.text);
    notes_input.val(item.notes);
    goal_input.val(item.goal);
 }
};

var saveEdit = function (id, List) {
  title_input = $('#item-title-' + id);
  notes_input = $('#item-notes-' + id);
  goal_input  = $('#item-goals-' + id + ' option:selected');

  List.update(id, {$set: {notes: notes_input.val(), text: title_input.val(),
                          goal: goal_input.val()}});

};

var cancelHabit = function (id, List) {
  if(id) {
    title_input = $('#item-title-' + id);
    notes_input = $('#item-notes-' + id);
    freq_input  = $('#habit-freq-' + id);
    goal_input  = $('#item-goals-' + id);

    item = List.findOne({_id: id});
    title_input.val(item.text);
    notes_input.val(item.notes);
    freq_input.val(item.freq);
    goal_input.val(item.goal);
  }
};

var saveHabit = function (id, List) {
  title_input = $('#item-title-' + id);
  notes_input = $('#item-notes-' + id);
  freq_input  = $('#habit-freq-' + id);
  goal_input  = $('#item-goals-' + id + ' option:selected');

  List.update(id, {$set: {notes: notes_input.val(), text: title_input.val(),
                          freq: freq_input.val(), goal: goal_input.val()}});
};

var stopProp = function (evt) {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  } else {
    evt.cancelBubble = true;
  }
};

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};
  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keyup" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};


$(document).keyup(function(e) {
    if (e.keyCode == 27) {
      cancelEdit(Session.get('edit_todo'), Todos);
      cancelEdit(Session.get('edit_daily'), Dailies);
      cancelHabit(Session.get('edit_habit'), Habits);
      Session.set('edit_todo', null);
      Session.set('edit_daily', null);
      Session.set('edit_habit', null);
    }   // esc
});

UI.body.events({'click' : function (evt)  {
    saveEdit(Session.get('edit_todo'), Todos);
    saveEdit(Session.get('edit_daily'), Dailies);
    saveHabit(Session.get('edit_habit'), Habits);
    Session.set('edit_todo', null);
    Session.set('edit_daily', null);
    Session.set('edit_habit', null);
}});

//Days
Template.days.today = function () {
  return moment().format('do MMM');
};

Template.days.today_chart = function () {
  if(Session.get('days_stats_today'))
    return DaysStats.findOne({_id: Session.get('days_stats_today')});
  else
    return {blank: 1};
};

Template.days.yesterday_chart = function () {
  return {blank: 1};
};

Template.days.before_chart = function () {
  return {blank: 1};
};

Template.chart.habit_height = function () {
  if(this.blank)
    return "1px;";
  else
    return this.habits + "em;";
};

Template.chart.daily_height = function () {
  if(this.blank)
    return "1px;";
  else
    return this.dailies + "em;";

}

Template.chart.todo_height = function () {
  if(this.blank)
    return "1px;";
  else
    return this.todos + "em;";

}

//Goals

Template.goals.all_active = function () {
  return (Session.get("active_goal") == null ? "active" : "");
};

Template.goals.goals = function () {
  return Goals.find({userId: Meteor.userId()});

};

Template.goals.is_selected = function () {
  return "wibble";
 //  (this._id == parentThis.goal ? "selected" : "");
};

Template.goal.is_active = function () {
  return (Session.get("active_goal") == this._id ? "active" : "");
};

Template.goals.events({
 'click li.all_goals': function (evt) {
    Session.set("active_goal", null);
  }
});

Template.goal.events({
 'click li.goals': function (evt) {
    Session.set("active_goal", this._id);
  }
});

//Habits

Template.habits.habits = function () {
  if(Meteor.userId())
    if(Session.get('active_goal') == null)
      return Habits.find({userId: Meteor.userId()});
    else
      return Habits.find({userId: Meteor.userId(), goal: Session.get('active_goal')});
  return [];
};

Template.habits.events(okCancelEvents(
  '#add-habit',
  {
    ok: function (text, evt) {
      Habits.insert({
        ticktime: (new Date(0)),
        userId: Meteor.userId(),
        text: text,
        done: false,
        notes: "",
        goal: null,
        timestamp: (new Date()).getTime(),
        freq: 7 //default frequency is once per week
    });
    evt.target.value='';
  },
    cancel: function (evt) {
      evt.target.value='';
    }
 }));

Template.habit_item.is_selected = function (parentThis){
  return (parentThis.goal == this._id ? "selected" : "");
};

Template.habit_item.goals = function (){
  return Goals.find({userId: Meteor.userId()});
};

Template.habit_item.events({
 'click .item-remove': function (evt) {
    //if(confirm("sure you want to delete that?"))
      Habits.remove(this._id);
    stopProp(evt);
  },
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .cancel-edit': function (evt) {
    cancelHabit(this._id, Habits);
    Session.set('edit_habit', null);
    stopProp(evt);
  },
  'click .item-checkbox': function (evt) {
    Habits.update(this._id, {$set: {ticktime: (new Date()).getTime()}});
    stopProp(evt);
  },
  'dblclick .item-text': function (evt) {
    if(Session.get('edit_habit') != this._id)
      Session.set('edit_habit', this._id);
    else {
      Session.set('edit_habit', null);
      saveHabit(this._id, habits);
    }

    clearSelect();
    stopProp(evt);
  },
  // prevent double click selection from closing the edit box
  'dblclick .item-edit-title, dblclick .item-edit-notes, dblclick .item-edit-freq ' : function(evt) {
    stopProp(evt);
  }


 });

Template.habit_item.habit_status = function() {
  //returns the urgency of this habit this.freq = ideal frequency in days.
  // this.tickedtime = time of last completion.
  days = 86400000; //milliseconds in one day;

  age = new Date() - this.ticktime;
  if(age < (this.freq/2) * days)
    return "habit-status-1";
  else if(age < this.freq * days)
    return "habit-status-2";
  else
    return "habit-status-3";
};

Template.habit_item.editing = function (evt) {
  return this._id == Session.get('edit_habit') ? "editing" : "";
};

//Dailies

Template.dailies.dailies = function () {
  if(Meteor.userId())
    if(Session.get('active_goal') == null)
      return Dailies.find({userId: Meteor.userId()});
    else
      return Dailies.find({userId: Meteor.userId(), goal: Session.get('active_goal')});
  return [];
};

Template.dailies.events(okCancelEvents(
  '#add-daily',
  {
    ok: function (text, evt) {
      Dailies.insert({
        userId: Meteor.userId(),
        text: text,
        done: false,
        notes: "",
        goal: null,
        timestamp: (new Date()).getTime(),
        ticktime: (new Date(0))
    });
    evt.target.value='';
  },
    cancel: function (evt) {
      evt.target.value='';
    }
 }));

Template.daily_item.is_selected = function (parentThis){
  return (parentThis.goal == this._id ? "selected" : "");
};

Template.daily_item.goals = function (){
  return Goals.find({userId: Meteor.userId()});
};

Template.daily_item.ticked = function () {
  if (this.done && (this.ticktime > new Date(new Date().toDateString()).getTime()))
    return 'ticked';
  else
    return 'unticked';
};

Template.daily_item.events({
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .item-remove': function (evt) {
      //if(confirm("sure you want to delete that?"))
        Dailies.remove(this._id);
    stopProp(evt);
  },
  'click .item-checkbox': function (evt) {
    Dailies.update(this._id, {$set: {done: !this.done, ticktime: (new Date()).getTime()}});
    stopProp(evt);
  },
  'click .cancel-edit': function (evt) {
    cancelEdit(this._id, Dailies);
    Session.set('edit_daily', null);
    stopProp(evt);
  },
  'dblclick .item-text': function (evt) {
    if(Session.get('edit_daily') != this._id)
      Session.set('edit_daily', this._id);
    else {
      Session.set('edit_daily', null);
      saveEdit(this._id, Dailies);
    }

    clearSelect();
    stopProp(evt);
  },
  'dblclick .item-edit-title, dblclick .item-edit-notes' : function(evt) {
    stopProp(evt);
  }
});

Template.daily_item.editing = function (evt) {
  return this._id == Session.get('edit_daily') ? "editing" : "";
};


//Todos
Template.todos.todos = function () {

  if(Meteor.userId())
    if(Session.get('active_goal') == null)
      return Todos.find({userId: Meteor.userId()},
                      {sort: [["done"], ["timestamp", "desc"] ]});
    else
      return Todos.find({userId: Meteor.userId(),
                       goal: Session.get('active_goal')},
                      {sort: [["done"], ["timestamp", "desc"] ]});

  return [{
        text: "Sign up for Todo:play",
        userId: null,
        done: false,
        notes: "",
        timestamp: (new Date()).getTime(),
        _id: "fake"
      }];
};

Template.todos.events(okCancelEvents(
  '.add-item-text',
  {
    ok: function (text, evt) {
      Todos.insert({
        text: text,
        goal: null,
        userId: Meteor.userId(),
        done: false,
        notes: "",
        timestamp: (new Date()).getTime(),
      });
      evt.target.value='';
    },
    cancel: function (evt) {
      evt.target.value='';
    }
  }
));

Template.todo_item.is_selected = function (parentThis){
  return (parentThis.goal == this._id ? "selected" : "");
};

Template.todo_item.goals = function (){
  return Goals.find({userId: Meteor.userId()});
};

Template.todo_item.ticked = function () {
  return this.done ? 'ticked' : 'unticked';
};

Template.todo_item.events({
  'click .item-remove': function (evt) {
    //if(confirm("sure you want to delete that?"))
      Todos.remove(this._id);
    stopProp(evt);
  },
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .cancel-edit': function (evt) {
    cancelEdit(this._id, Todos);
    Session.set('edit_todo', null);
    stopProp(evt);
  },
  'click .item-checkbox': function (evt) {
    Todos.update(this._id, {$set:
                              {done: !this.done, ticktime: (new Date())}});
    stopProp(evt);
  },
  'dblclick .item-text': function (evt) {
    if(Session.get('edit_todo') != this._id)
      Session.set('edit_todo', this._id);
    else {
      Session.set('edit_todo', null);
      saveEdit(this._id, Todos);
    }

    clearSelect();
    stopProp(evt);
  },
  'dblclick .item-edit-title, dblclick .item-edit-notes' : function(evt) {
    stopProp(evt);
  }
});

Template.todo_item.editing = function (evt) {
  return this._id == Session.get('edit_todo') ? "editing" : "";
};

