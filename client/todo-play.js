// Collections

Goals = new Meteor.Collection("goals");
Habits = new Meteor.Collection("habits");
Dailies = new Meteor.Collection("dailies");
Todos = new Meteor.Collection("todos");

// Header stuff
DaysStats = new Meteor.Collection("days_stats");
DoneTicker = new Meteor.Collection("done_ticker");

//user config stuff
UserConfig = new Meteor.Collection("user_config");

// Sessions
Session.setDefault('edit_todo', null);
Session.setDefault('edit_daily', null);
Session.setDefault('edit_habit', null);

Session.setDefault('today', null);
Session.setDefault('days_stats_today', null);
Session.setDefault('days_stats_yesterday', null);
Session.setDefault('days_stats_before', null);

Session.setDefault('active_goal', null);
Session.setDefault('show_config', null);

Session.setDefault('ticker_count', null);
Session.setDefault('ticker_active', null);

Session.setDefault('time_now', new Date().getTime());
// Subscriptions


var doneTickerHandle = Meteor.subscribe('done_ticker', function () {

});
var daysStatsHandle = Meteor.subscribe('days_stats', function () {
  setupDaysStats();
});

var todoHandle = Meteor.subscribe('todos', function () {

});

var goalHandle = Meteor.subscribe('goals', function () {

});

var dailiesHandle = Meteor.subscribe('dailies', function () {

});

var habitsHandle = Meteor.subscribe('habits', function () {

});

var configHandle = Meteor.subscribe('user_config', function () {

});


// Hacks & Cludges:
// bootstrap 3 navbar fix
$(window).on('load resize', function() {
      $('body').css({"padding-top": $(".navbar").height() + 30 + "px"});
});


//returns mid day of the 'day' the user is currently in this is configured by
// the day_end setting so if it is 02:00 on the 9th and their day end is 3am it
// returns 12:00 on the 8th
var whatDayIsThis = function (date) {
  var day_end = 0;
  user_config = UserConfig.findOne({userId: Meteor.userId()});
  if (user_config)
    day_end = user_config.day_end;

  return moment(date).subtract(day_end, 'hours').startOf('day'
                    ).add(12, 'hours');
};

var isDailyTicked = function (daily) {
  var user_config = UserConfig.findOne({userId: Meteor.userId()});
  var day_end = 0;
  if(user_config)
    day_end = user_config.day_end;

  return (daily.done && (daily.ticktime >
    whatDayIsThis(moment(Session.get('time_now'))).subtract((12 - day_end), 'hours').toDate().getTime()))

}

// Initialize stats
var setupDaysStats = function () {
  var date = whatDayIsThis(new Date());
  if (Session.get('today') === date.toString() || !Meteor.userId()
    || !daysStatsHandle.ready() ) {
    // already setup the date to today or have no user so keep on trucking

  } else {

    Session.set('today', date.toString());

    var todays_stats = DaysStats.findOne({date: date.toDate()});
    if(todays_stats == null)
      Session.set('days_stats_today', null);
    else
      Session.set('days_stats_today', todays_stats._id);

    var date = date.subtract(1, 'day');
    var yesterdays_stats = DaysStats.findOne({date: date.toDate()});
    if(yesterdays_stats == null)
      Session.set('days_stats_yesterday', null);
    else
      Session.set('days_stats_yesterday', yesterdays_stats._id);

    date = date.subtract(1, 'day');
    var befores_stats = DaysStats.findOne({date: date.toDate()});
    if(befores_stats == null)
      Session.set('days_stats_before', null);
    else
      Session.set('days_stats_before', befores_stats._id);

  }
};

Tracker.autorun( function (comp) {
  if(Meteor.userId())
  {
    setupDaysStats();
  }
});

Meteor.startup( function () {
$(document).ready(function() {
  if (document.location.hostname.search("callsar.com") !== -1) {
    console.log("GA tracking is happening");
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-55690981-1', 'callsar.com');
      ga('send', 'pageview');
    }
  });
});

// update the day every min
Meteor.setInterval(function () {
  Session.set('time_now', new Date().getTime());
  setupDaysStats();
}, 60000);


// update the done ticker every 10 seconds
Meteor.setInterval(function () {
  Session.set('ticker_active', (Session.get('ticker_active') * -1));
  Meteor.setTimeout(function () {
    next = Math.abs(Session.get('ticker_active')) + 1;
    if( next >= Session.get('ticker_count'))
      next = 1;
    Session.set('ticker_active', (next * -1));

    Meteor.setTimeout(function () {
      Session.set('ticker_active', (Session.get('ticker_active') * -1));
    }, 2000);
  }, 2000);
}, 10000);

var findOrCreateTodaysStats = function () {
  var today_id = Session.get('days_stats_today');
  var day = DaysStats.findOne({_id: Session.get('days_stats_today')});

  if(!day) {
    day = DaysStats.insert({date: whatDayIsThis(new Date()).toDate(),
                            userId: Meteor.userId(),
                            habits: 0,
                            dailies: 0,
                            todos: 0});

    day = DaysStats.findOne({_id: day});
  }
  Session.set('days_stats_today', day._id);
  return day;
};

var updateStats = function (type, upOrDown, tickedOn) {

  if(daysStatsHandle.ready() && Meteor.userId() != null) {
      var to_set = {};
    if(upOrDown) {
      var todaysStats = findOrCreateTodaysStats();
      to_set[type] = todaysStats[type] + 1;
      DaysStats.update(todaysStats._id, {$set: to_set});
    } else {
      var stats = DaysStats.findOne({date: whatDayIsThis(tickedOn).toDate()});
      if(stats) {
        to_set[type] = stats[type] < 1 ? 0 : stats[type] - 1;
        DaysStats.update(stats._id, {$set: to_set});
      } else {
        console.log("could not find a stats entry for ticked time of " + tickedOn + " this should be impossible...");

      }
    }
  }
};

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
    var title_input = $('#item-title-' + id);
    var notes_input = $('#item-notes-' + id);
    var goal_input  = $('#item-goals-' + id);
    var private_input = $('#item-private-' + id);

    var item = List.findOne({_id: id});
    title_input.val(item.text);
    notes_input.val(item.notes);
    goal_input.val(item.goal);
    goal_input.val(item.goal);
    private_input.checked = item.private;
 }
};

var saveEdit = function (id, List) {
  var title_input = $('#item-title-' + id);
  var notes_input = $('#item-notes-' + id);
  var goal_input  = $('#item-goals-' + id + ' option:selected');
  var private_input = $('#item-private-' + id);

  List.update(id, {$set: {notes: notes_input.val(), text: title_input.val(),
                          goal: goal_input.val(),
                          private: private_input.prop("checked")}});

};

var cancelHabit = function (id, List) {
  if(id) {
    var title_input = $('#item-title-' + id);
    var notes_input = $('#item-notes-' + id);
    var freq_input  = $('#habit-freq-' + id);
    var goal_input  = $('#item-goals-' + id);

    var item = List.findOne({_id: id});
    title_input.val(item.text);
    notes_input.val(item.notes);
    freq_input.val(item.freq);
    goal_input.val(item.goal);
  }
};

var saveHabit = function (id, List) {
  var title_input = $('#item-title-' + id);
  var notes_input = $('#item-notes-' + id);
  var freq_input  = $('#habit-freq-' + id);
  var goal_input  = $('#item-goals-' + id + ' option:selected');

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

//Body
Template.body.events({
  'click a#edit_config' : function (evt) {
    Session.set('show_config', true);
  },
  'click' : function (evt)  {
    if (Session.get('edit_todo'))
      saveEdit(Session.get('edit_todo'), Todos);
    if (Session.get('edit_daily'))
      saveEdit(Session.get('edit_daily'), Dailies);
    if (Session.get('edit_habit'))
      saveHabit(Session.get('edit_habit'), Habits);
    Session.set('edit_todo', null);
    Session.set('edit_daily', null);
    Session.set('edit_habit', null);
  }});

Template.body.user_config = function () {
  // find or create a UserConfig
  if(Meteor.userId) {
    user_config = UserConfig.findOne({userId: Meteor.userId()});
    if(user_config)
      return user_config
    else
      user_config = UserConfig.insert({
        userId: Meteor.userId(),
        day_end: 0,
        red_age: 30,
        display_name: "Anon"
      });
    return UserConfig.findOne({_id: user_config});
  }
  return null
}

//Config
Template.config.events({
  'click button#cancel': function (evt, template) {
    template.$('#day_end').val(this.day_end);
    template.$('#display_name').val(this.display_name);
    template.$('#red_age').val(this.red_age);


    Session.set('show_config', false);
  },
  'click button#save': function (evt, template) {
    UserConfig.update(this._id, {$set: { red_age: template.$('#red_age').val(),
                               day_end: template.$('#day_end').val(),
                               display_name: template.$('#display_name').val()}
                      });
    Session.set('show_config', false);
  }
});

//Days
Template.days.today = function () {
  return moment().format('Do MMM YY');
};

Template.days.today_chart = function () {
  if(Session.get('days_stats_today'))
    return DaysStats.findOne({_id: Session.get('days_stats_today')});
  else
    return {blank: 1};
};

Template.days.yesterday_chart = function () {
  if(Session.get('days_stats_yesterday'))
    return DaysStats.findOne({_id: Session.get('days_stats_yesterday')});
  else
    return {blank: 1};
};

Template.days.before_chart = function () {
  if(Session.get('days_stats_before') != null)
    return DaysStats.findOne({_id: Session.get('days_stats_before')});
  else
    return {blank: 1};
};

Template.days.ticker_active = function (index) {
  if (Session.get('ticker_active') == index ) {
    return '';
  } else if (Session.get('ticker_active') == (-1 * index)) {
    return 'hiding';
  } else {
    return 'hide';
  }
};

Template.days.tickers = function () {
  tickers = DoneTicker.find();
  Session.set('ticker_count', tickers.count() + 1);
  Session.set('ticker_active', 1);

  return DoneTicker.find({}).map(function(doc, index) {
                               doc.index = index + 1;
                               return doc;
                             });
};

//return the highest value of 'type' in today/yesterday/before stats
var findChartMax = function(type) {
  var today = DaysStats.findOne({_id: Session.get('days_stats_today')});
  var yesterday = DaysStats.findOne({_id: Session.get('days_stats_yesterday')});
  var before = DaysStats.findOne({_id: Session.get('days_stats_before')});
  //console.log(today);
  //console.log(yesterday);
  //console.log(before);
  var max = 5; // if max is <5 we pretend it's 5 so 1 done item isn't a whole chart
  if ( today && max < today[type])
    max = today[type];
  if (yesterday && max < yesterday[type])
    max = yesterday[type];
  if (before && max < before[type])
    max = before[type];

  return max;
};

Template.chart.habit_height = function () {
  if(this.blank || this.habits == 0)
    return "1px;";
  else
    var max = findChartMax('habits');
    return ((this.habits / max) * 7) + "em;";
};

Template.chart.daily_height = function () {
  if(this.blank || this.dailies == 0)
    return "1px;";
  else {
    // 7em max height;
    var max = Dailies.find({}).count();
    return ((this.dailies / max) * 7) + "em;";
  }
}

Template.chart.todo_height = function () {
  if(this.blank || this.todos == 0)
    return "1px;";
  else {
    var max = findChartMax('todos');
    return ((this.todos / max) * 7) + "em;";
  }
}

//Goals

Template.goals.all_active = function () {
  return (Session.get("active_goal") == null ? "active" : "");
};

Template.goals.goals = function () {
  return Goals.find({userId: Meteor.userId()});
};

Template.goals.events(okCancelEvents(
  '#add-goal',
  {
    ok: function (text, evt) {
      Goals.insert({
      userId: Meteor.userId(),
      text: text
      });
      evt.target.value='';
    },
      cancel: function (evt) {
        evt.target.value='';
    }
  })
);

Template.goal.is_active = function () {
  return (Session.get("active_goal") == this._id ? "active" : "");
};

Template.goals.events({
 'click li.all-goals': function (evt) {
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
      return Habits.find({userId: Meteor.userId()},
                         {sort: ["timestamp", "desc"]});
    else
      return Habits.find({userId: Meteor.userId(),
                                  goal: Session.get('active_goal')},
                         {sort: ["timestamp", "desc"]});
    else
  return [];
};

Template.habits.events(okCancelEvents(
  '#add-habit',
  {
    ok: function (text, evt) {
    var habit = Habits.insert({
        ticktime: (new Date(0)),
        userId: Meteor.userId(),
        text: text,
        done: false,
        notes: "",
        goal: Session.get('active_goal'),
        timestamp: (new Date()).getTime(),
        freq: 7 //default frequency is once per week
    });
    Session.set('edit_habit', habit);
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
    if(confirm("sure you want to delete that?"))
      Habits.remove(this._id);
    stopProp(evt);
  },
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .save-edit': function (evt) {
    saveHabit(this._id, Habits);
    Session.set('edit_habit', null);
    stopProp(evt);
  },
  'click .cancel-edit': function (evt) {
    cancelHabit(this._id, Habits);
    Session.set('edit_habit', null);
    stopProp(evt);
  },
  'click .item-checkbox': function (evt) {
    Habits.update(this._id, {$set: {ticktime: (new Date()).getTime()}});
    updateStats('habits', true, null); // habits can only be incremented
    stopProp(evt);
  },
  'click .expand-edit': function (evt) {
    if(Session.get('edit_habit') == null) {
      Session.set('edit_habit', this._id);
    } else if(Session.get('edit_habit') != this._id) {
      saveHabit(Session.get('edit_habit'),  Habits);
      Session.set('edit_habit', this._id);
    } else {
      Session.set('edit_habit', null);
      saveHabit(this._id, Habits);
    }

    stopProp(evt);
  },

  'dblclick .item-text': function (evt) {
    if(Session.get('edit_habit') == null)
      Session.set('edit_habit', this._id);
    else if(Session.get('edit_habit') != this._id) {
      saveHabit(Session.get('edit_habit'),  Habits);
      Session.set('edit_habit', this._id);
    } else {
      Session.set('edit_habit', null);
      saveHabit(this._id, Habits);
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
  var days = 86400000; //milliseconds in one day;

  var age = new Date() - this.ticktime;
  if(age < (this.freq/2) * days)
    return "habit-status-1";
  else if(age < this.freq * days)
    return "habit-status-2";
  else
    return "habit-status-3";
};

Template.habit_item.not_editing = function (evt) {
  return this._id == Session.get('edit_habit') ? "" : "editing";
};

Template.habit_item.editing = function (evt) {
  return this._id == Session.get('edit_habit') ? "editing" : "";
};

//Dailies

Template.dailies.dailies = function () {
  if(Meteor.userId())
    if(Session.get('active_goal') == null)
      return Dailies.find({userId: Meteor.userId()},
                      {sort: ["timestamp", "desc"]});
    else
      return Dailies.find({userId: Meteor.userId(),
                           goal: Session.get('active_goal')},
                          {sort: ["timestamp", "desc"]});
  return [];
};

Template.dailies.events(okCancelEvents(
  '#add-daily',
  {
    ok: function (text, evt) {
      var daily = Dailies.insert({
        userId: Meteor.userId(),
        text: text,
        done: false,
        private: null,
        notes: "",
        goal: Session.get('active_goal'),
        timestamp: (new Date()).getTime(),
        ticktime: (new Date(0))
    });
    Session.set('edit_daily', daily);
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

Template.daily_item.ticked_icon = function () {
  if (isDailyTicked(this))
    return 'glyphicon glyphicon-ok';
  else
    return '';
};

Template.daily_item.ticked = function () {

  if (isDailyTicked(this))
    return 'ticked';
  else
    return '';
};

Template.daily_item.events({
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .item-remove': function (evt) {
      if(confirm("sure you want to delete that?"))
        Dailies.remove(this._id);
    stopProp(evt);
  },
  'click .item-checkbox': function (evt) {
    var is_ticked = isDailyTicked(this);
    Dailies.update(this._id, {$set: {done: !is_ticked, ticktime: (new Date()).getTime()}});
    updateStats('dailies', !is_ticked, this.ticktime);
    stopProp(evt);
  },
  'click .save-edit': function (evt) {
    saveEdit(this._id, Dailies);
    Session.set('edit_daily', null);
    stopProp(evt);
  },
  'click .cancel-edit': function (evt) {
    cancelEdit(this._id, Dailies);
    Session.set('edit_daily', null);
    stopProp(evt);
  },
  'click .expand-edit': function (evt) {
    if(Session.get('edit_daily') == null) {
      Session.set('edit_daily', this._id);
    } else if(Session.get('edit_daily') != this._id) {
      saveEdit(Session.get('edit_daily'),  Dailies);
      Session.set('edit_daily', this._id);
    } else {
      Session.set('edit_daily', null);
      saveEdit(this._id, Dailies);
    }

    stopProp(evt);
  },

  'dblclick .item-text': function (evt) {
    if(Session.get('edit_daily') == null) {
      Session.set('edit_daily', this._id);
    } else if(Session.get('edit_daily') != this._id) {
      saveEdit(Session.get('edit_daily'), Dailies);
      Session.set('edit_daily', this._id);
    } else {
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

Template.daily_item.not_editing = function (evt) {
  return this._id == Session.get('edit_daily') ? "" : "editing";
}

Template.daily_item.editing = function (evt) {
  return this._id == Session.get('edit_daily') ? "editing" : "";
};


//Todos
Template.todos.todos = function () {

  if(Meteor.userId())
    if(Session.get('active_goal') == null)
    {
      var day_start =  moment().startOf('day').toDate();
      return Todos.find({userId: Meteor.userId(),
                         $or: [{done: true, ticktime: {$gt: day_start}},
                               {done: false}]
                        },
                      {sort: [["done", "desc"], ["timestamp", "desc"] ]});
    } else {
      return Todos.find({userId: Meteor.userId(),
                         goal: Session.get('active_goal'),
                         $or: [{done: true, ticktime: {$gt: day_start}},
                             {done: false}]
                       },
                      {sort: [["done", "desc"], ["timestamp", "desc"] ]});
    }
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
        goal: Session.get('active_goal'),
        userId: Meteor.userId(),
        done: false,
        private: false,
        notes: "",
        ticktime: (new Date(0)),
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

Template.todo_item.ticked_icon = function () {
  return this.done ? 'glyphicon glyphicon-ok' : '';
};

Template.todo_item.ticked = function () {
  return this.done ? 'ticked' : '';
};

Template.todo_item.color = function () {
  if(this.done){
    return ""
  } else {
    var user_config = UserConfig.findOne({userId: Meteor.userId()});
    if(!user_config || !user_config.red_age)
      user_config = {red_age: 30}; // default red_age of 30 days

    //blue: #779ECB
    //blue = rgb(119, 158, 203)
    //red:  #FF7373
    //red = rgb(255, 115, 115)

    var rblue = 119;
    var gblue = 158;
    var bblue = 203;

    var rdiff = -136;
    var gdiff = 43;
    var bdiff = 88;

    var age = new Date() - new Date(this.timestamp);
    var red_age = user_config.red_age * 24 * 60 * 60 * 1000;

    if(age < 0)
      return '#779ECB';
    if(age > red_age)
      age = red_age;

    age_frac = age / red_age;

    var to_ret =  'rgb(' + Math.floor(rblue - (rdiff * age_frac)) + ',' +
    Math.floor(gblue - (gdiff * age_frac)) + ',' +
    Math.floor(bblue - (bdiff * age_frac)) + ')';

    return to_ret;
  }
};

Template.todo_item.events({
  'click .item-remove': function (evt) {
    if(confirm("sure you want to delete that?"))
      Todos.remove(this._id);
    stopProp(evt);
  },
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .save-edit': function (evt) {
    saveEdit(this._id, Todos);
    Session.set('edit_todo', null);
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
    updateStats('todos', !this.done, this.ticktime);
    stopProp(evt);
  },
  'click .expand-edit': function (evt) {
    if(Session.get('edit_todo') == null) {
      Session.set('edit_todo', this._id);
    } else if(Session.get('edit_todo') != this._id) {
      saveEdit(Session.get('edit_todo'),  Todos);
      Session.set('edit_todo', this._id);
    } else {
      Session.set('edit_todo', null);
      saveEdit(this._id, Todos);
    }

    stopProp(evt);
  },
  'dblclick .item-text': function (evt) {

    if(Session.get('edit_todo') == null) {
      Session.set('edit_todo', this._id);
    } else if(Session.get('edit_todo') != this._id) {
      saveEdit(Session.get('edit_todo'),  Todos);
      Session.set('edit_todo', this._id);
    } else {
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

Template.todo_item.not_editing = function (evt) {
  return this._id == Session.get('edit_todo') ? "" : "editing";
};

Template.todo_item.editing = function (evt) {
  return this._id == Session.get('edit_todo') ? "editing" : "";
};

