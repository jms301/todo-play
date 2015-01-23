Session.setDefault('today', null);
Session.setDefault('days_stats_today', null);
Session.setDefault('days_stats_yesterday', null);
Session.setDefault('days_stats_before', null);

var daysStatsHandle = Meteor.subscribe('days_stats', function () {
    setupDaysStats();
});

//returns mid day of the 'day' the user is currently in this is configured by
// the day_end setting so if it is 02:00 on the 9th and their day end is 3am it
// returns 12:00 on the 8th
var whatDayIsThis = function (date) {
  if (Meteor.user()) {
    var day_end = (Meteor.user().profile.day_end || 0);
  } else {
    var day_end = 0;
  }

  return moment(date).subtract(day_end, 'hours').startOf('day'
                    ).add(12, 'hours');
};


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
  }else {
    // no user so re-set the Sessions to blank.
    Session.set('today', null);
    Session.set('days_stats_today', null);
    Session.set('days_stats_yesterday', null);
    Session.set('days_stats_before', null);
  }
});

// update the day every min
Meteor.setInterval(function () {
  Session.set('time_now', new Date().getTime());
  setupDaysStats();
}, 60000);


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

updateStats = function (type, upOrDown, tickedOn) {

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

//Days
Template.days.helpers({
  today: function () {
    return moment().format('Do MMM YY');
  },

  today_chart: function () {
    if(Session.get('days_stats_today'))
      return DaysStats.findOne({_id: Session.get('days_stats_today')});
    else
      return {blank: 1};
  },

  yesterday_chart: function () {
    if(Session.get('days_stats_yesterday'))
      return DaysStats.findOne({_id: Session.get('days_stats_yesterday')});
    else
      return {blank: 1};
  },

  before_chart: function () {
    if(Session.get('days_stats_before') != null)
      return DaysStats.findOne({_id: Session.get('days_stats_before')});
    else
      return {blank: 1};
  }
});

//return the highest value of 'type' in today/yesterday/before stats
var findChartMax = function(type) {
  var today = DaysStats.findOne({_id: Session.get('days_stats_today')});
  var yesterday = DaysStats.findOne({_id: Session.get('days_stats_yesterday')});
  var before = DaysStats.findOne({_id: Session.get('days_stats_before')});
  var max = 5; // if max is <5 we pretend it's 5 so 1 done item isn't a whole chart
  if ( today && max < today[type])
    max = today[type];
  if (yesterday && max < yesterday[type])
    max = yesterday[type];
  if (before && max < before[type])
    max = before[type];

  return max;
};


Template.chart.helpers({
  habit_height: function () {
    if(this.blank || this.habits == 0)
      return "1px;";
    else
      var max = findChartMax('habits');
      return ((this.habits / max) * 7) + "em;";
  },

  daily_height: function () {
    if(this.blank || this.dailies == 0)
      return "1px;";
    else {
      // 7em max height;
      var max = Dailies.find({}).count();
      return ((this.dailies / max) * 7) + "em;";
    }
  },

  todo_height: function () {
    if(this.blank || this.todos == 0)
      return "1px;";
    else {
      var max = findChartMax('todos');
      return ((this.todos / max) * 7) + "em;";
    }
  }
});
