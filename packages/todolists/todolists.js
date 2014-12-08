//Session setup
Session.setDefault('edit_todo', null);
Session.setDefault('edit_daily', null);
Session.setDefault('edit_habit', null);


//Collection handles
var todoHandle = Meteor.subscribe('todos', function () {

});

var dailiesHandle = Meteor.subscribe('dailies', function () {

});

var habitsHandle = Meteor.subscribe('habits', function () {

});
var channel = (channel || []);
//DRY functions for habits/dailies/todos

cancelEdit = function (id, List) {
  if(id) {
    var title_input = $('#item-title-' + id);
    var notes_input = $('#item-notes-' + id);
    var project_input  = $('#item-projects-' + id);
    var private_input = $('#item-private-' + id);
    var check_list = $('.item-checklist-' + id).toArray();


    var item = List.findOne({_id: id});

    title_input.val(item.text);
    notes_input.val(item.notes);
    project_input.val(item.project);
    private_input.checked = item.private;

    _.each(item.checklist, function (item, index) {
      check_list[index].checked = item.done;
    });
  }
};

saveEdit = function (id, List) {
  var title_input = $('#item-title-' + id);
  var notes_input = $('#item-notes-' + id);
  var project_input  = $('#item-projects-' + id + ' option:selected');
  var private_input = $('#item-private-' + id);
  var check_list = $('.item-checklist-' + id).toArray();

  check_list = _.map(check_list, function (item, index) {
    return {done: item.checked, item_text: item.value, index: index};
  });

  List.update(id, {$set: {notes: notes_input.val(), text: title_input.val(),
                          project: project_input.val(), checklist: check_list,
                          private: private_input.prop("checked")}});

};

cancelHabit = function (id, List) {
  if(id) {
    var title_input = $('#item-title-' + id);
    var notes_input = $('#item-notes-' + id);
    var freq_input  = $('#habit-freq-' + id);
    var project_input  = $('#item-projects-' + id);

    var item = List.findOne({_id: id});
    title_input.val(item.text);
    notes_input.val(item.notes);
    freq_input.val(item.freq);
    project_input.val(item.project);
  }
};

saveHabit = function (id, List) {
  var title_input = $('#item-title-' + id);
  var notes_input = $('#item-notes-' + id);
  var freq_input  = $('#habit-freq-' + id);
  var project_input  = $('#item-projects-' + id + ' option:selected');

  List.update(id, {$set: {notes: notes_input.val(), text: title_input.val(),
                        freq: freq_input.val(), project: project_input.val()}});
};

$(document).keyup(function(e) {
    if (e.keyCode == 27) {
      cancelEdit(Session.get('edit_todo'), Todos);
      cancelEdit(Session.get('edit_daily'), Dailies);
      cancelHabit(Session.get('edit_habit'), Habits);
      Session.set('edit_todo', null);
      Session.set('edit_daily', null);
      Session.set('edit_habit', null);
    }   // esc -> cancel and close every thing
});

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
};

//Habits

Template.habits.helpers({
  habits: function () {
    if(Meteor.userId())
      if(Session.get('active_project') === false)
        return Habits.find({userId: Meteor.userId()},
                           {sort: ["rank", "desc"]});
      else
        return Habits.find({userId: Meteor.userId(),
                                    project: Session.get('active_project')},
                           {sort: ["rank", "desc"]});
    else
      return [];
  }
});

Template.habits.events({

  'keydown #add-habit, keyup #add-habit, focusout #add-habit': function (evt) {
    if(evt.type === 'keyup' && evt.which === 27) { //esc -> cancel
      //cancel
      evt.target.value='';
    }
    if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        low_rank = Habits.findOne({},{sort:{rank: 1, reactive: false}});
        low_rank = low_rank ? low_rank.rank : 1;

        var habit = Habits.insert({
          ticktime: (new Date(0)),
          userId: Meteor.userId(),
          text: value,
          done: false,
          notes: "",
          project: (Session.get('active_project') || ""),
          timestamp: (new Date()).getTime(),
          freq: 7, //default frequency is once per week
          rank: low_rank - 1
        });
        Session.set('edit_habit', habit);
        evt.target.value='';
      } else {
        //cancel
        evt.target.value='';
      }
    }
    stopProp(evt);
  },
  'click .add-item-btn' : function(evt) {
    stopProp(evt);
  }
});

Template.habits.rendered = function() {
    this.$('#habit-list').sortable({
        stop: function(e, ui) {
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0)
          before = ui.item.prev().get(0)
          after = ui.item.next().get(0)

          if(!before) {
            newRank = Blaze.getData(after).rank - 1
          } else if(!after) {
            newRank = Blaze.getData(before).rank + 1
          }
          else
            newRank = (Blaze.getData(after).rank +
                       Blaze.getData(before).rank)/2

          //update the dragged Item's rank
          Habits.update({_id: Blaze.getData(el)._id}, {$set: {rank: newRank}})
        }
    })
};

Template.habit_item.helpers({
  habit_status: function() {
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
  },

  not_editing: function (evt) {
    return this._id == Session.get('edit_habit') ? "" : "editing";
  },

  editing: function (evt) {
    return this._id == Session.get('edit_habit') ? "editing" : "";
  }
});


Template.habit_item.events({
 'click .item-remove-x': function (evt) {
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

  'click .expand-edit, dblclick .item-text': function (evt) {
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

//Dailies

Template.dailies.helpers({
  dailies: function () {
    if(Meteor.userId())
      if(Session.get('active_project') === false)
        return Dailies.find({userId: Meteor.userId()},
                        {sort: ["rank", "desc"]});
      else
        return Dailies.find({userId: Meteor.userId(),
                             project: Session.get('active_project')},
                            {sort: ["rank", "desc"]});
    return [];
  }
});

Template.dailies.events({

  'keydown #add-daily, keyup #add-daily, focusout #add-daily': function (evt) {
    if(evt.type === 'keyup' && evt.which === 27) { //esc -> cancel
      //cancel
      evt.target.value='';
    }
    if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        low_rank = Dailies.findOne({}, {sort:{rank: 1}, reactive: false});
        low_rank = low_rank ? low_rank.rank : 1;

        var daily = Dailies.insert({
          userId: Meteor.userId(),
          text: value,
          done: false,
          private: null,
          notes: "",
          project: (Session.get('active_project') || ""),
          timestamp: (new Date()).getTime(),
          ticktime: (new Date(0)),
          rank: low_rank - 1
        });
        Session.set('edit_daily', daily);
        evt.target.value='';
      } else {
        //cancel
        evt.target.value='';
      }
    }
    stopProp(evt);
  },
  'click .add-item-btn' : function(evt) {
    stopProp(evt);
  }
});

Template.dailies.rendered = function() {
    this.$('#daily-list').sortable({
        stop: function(e, ui) {
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0)
          before = ui.item.prev().get(0)
          after = ui.item.next().get(0)

          if(!before) {
            newRank = Blaze.getData(after).rank - 1
          } else if(!after) {
            newRank = Blaze.getData(before).rank + 1
          }
          else
            newRank = (Blaze.getData(after).rank +
                       Blaze.getData(before).rank)/2

          //update the dragged Item's rank
          Dailies.update({_id: Blaze.getData(el)._id}, {$set: {rank: newRank}})
        }
    })
};


Template.daily_item.helpers({
  ticked_icon: function () {
    if (isDailyTicked(this))
      return 'glyphicon glyphicon-ok';
    else
      return '';
  },

  ticked: function () {
    if (isDailyTicked(this))
      return 'ticked';
    else
      return '';
  },

  not_editing: function (evt) {
    return this._id == Session.get('edit_daily') ? "" : "editing";
  },

  editing: function (evt) {
    return this._id == Session.get('edit_daily') ? "editing" : "";
  }
});

Template.daily_item.events({
  'click li': function (evt) {
    stopProp(evt);
  },
  'click .item-remove-x': function (evt) {
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

  'dblclick .item-text, click .expand-edit': function (evt) {
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


//Todos
Template.todos.helpers({
  done_todos: function () {
  if(Meteor.userId()){
    var day_start =  moment().startOf('day').toDate();

    filter = {userId: Meteor.userId(),
              done: true,
              ticktime: {$gt: day_start}};

    if(Session.get('active_project') !== false)
      filter['project'] = Session.get('active_project');

    var with_tags = Session.get("with_tags");
    var without_tags = Session.get("without_tags");

    if(with_tags.length != 0) {
      filter['tags'] = {};
      filter['tags']['$in'] = with_tags;
    }
    if(without_tags.length != 0) {
      filter['tags'] = (filter['tags'] || {});
      filter['tags']['$nin'] = without_tags;
    }

    return Todos.find(filter, {sort: ["ticktime", "desc"]});
  }
  },

  todos: function () {

    if(Meteor.userId()) {
      var with_tags = Session.get("with_tags");
      var without_tags = Session.get("without_tags");
      var filter = {userId: Meteor.userId(),
                done: false,
                $or: [{hide_until: null},
                      {hide_until:
                      {$lt: new Date(Session.get("time_now"))}}]};

      if(with_tags.length != 0) {
        filter['tags'] = {};
        filter['tags']['$in'] = with_tags;
      }
      if(without_tags.length != 0) {
        filter['tags'] = (filter['tags'] || {});
        filter['tags']['$nin'] = without_tags;
      }

      if(Session.get('active_project') !== false)
        filter.project = Session.get('active_project');

      return Todos.find(filter , {sort: ["rank", "desc"]});
    } else {
      return [{
          text: "Sign up for Todo:play",
          userId: null,
          done: false,
          notes: "",
          timestamp: (new Date()).getTime(),
          _id: "fake"
      }];
    }
  }
});

Template.todos.events({
 'keydown .add-item-text, keyup .add-item-text, focusout .add-item-text': function (evt) {
    if(evt.type === 'keyup' && evt.which === 27) {
      //cancel
      evt.target.value='';
    } else if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        low_rank = Todos.findOne({done:false},{sort:{rank: 1}});
        low_rank = low_rank ? low_rank.rank : 1;

        Todos.insert({
          text: value,
          project: (Session.get('active_project') || ""),
          userId: Meteor.userId(),
          done: false,
          private: false,
          notes: "",
          ticktime: (new Date(0)),
          timestamp: (new Date()).getTime(),
          rank: low_rank - 1
        });
        evt.target.value='';
      } else {
       //cancel
        evt.target.value='';
      }
    }
  }
});

Template.todos.rendered = function() {
    this.$('#todo-list').sortable({
        stop: function(e, ui) {
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0)
          before = ui.item.prev().get(0)
          after = ui.item.next().get(0)

          if(!before) {
            newRank = Blaze.getData(after).rank - 1
          } else if(!after) {
            newRank = Blaze.getData(before).rank + 1
          }
          else
            newRank = (Blaze.getData(after).rank +
                       Blaze.getData(before).rank)/2

          //update the dragged Item's rank
          Todos.update({_id: Blaze.getData(el)._id}, {$set: {rank: newRank}})
        }
    })
};

Template.todo_item.helpers({

  ticked_icon: function () {
    return this.done ? 'glyphicon glyphicon-ok' : '';
  },

  ticked: function () {
    return this.done ? 'ticked' : '';
  },

  color: function () {
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
  },
  not_editing: function () {
    return this._id == Session.get('edit_todo') ? "" : "editing";
  },
  editing: function () {
    return this._id == Session.get('edit_todo') ? "editing" : "";
  },
  checked: function (is_checked) {
    return is_checked ? "checked" : "";
  },
  getid: function (item) {
    return item._id;
  }
});

Template.todo_item.events({
  'click .remove-list-item': function (evt, template) {

      var list = template.data.checklist
      list.splice(evt.target.id.split('-')[0], 1);

      // fix the hacky index (used to identify what gets removed)
      list = _.map(list,
                  function (item, index) {
                         item.index = index;
                         return item; });

      Todos.update(template.data._id, {$set:
                              {checklist: list }});
      stopProp(evt);
  },
  'keydown input.checklist, keyup input.checklist, focusout input.checklist':
  function (evt, template) {
    if(evt.type === 'keyup' && evt.which === 27) { //esc -> cancel
      //cancel
      evt.target.value='';
    }
    if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        var list = this.checklist;
        if(!list)
          list = [];
        list.push({done: false,
                   item_text: template.$('input.checklist').val(),
                   index: list.length});
        Todos.update(this._id, {$set:
                              {checklist: list}});
        evt.target.value = '';

      } else {
        //cancel
        evt.target.value='';
      }
    }
    stopProp(evt);
  },
  'click .hide-until.editing': function (evt) {
    $("#hide-until-id").val(this._id);
    if(this.hide_until) {
      $("#datepicker").val(moment(this.hide_until).format("YYYY/MM/DD"));
    }
    $("#until-modal").modal('show');
    stopProp(evt);
  },
  'click .item-remove-x': function (evt) {
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
  'dblclick .item-text, click .expand-edit': function (evt) {

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

//tags messaging
Meteor.startup(function () {
  channel['delete_tag'] =
    Mediator.subscribe('delete_tag', function (evt, data) {

      Todos.find({_id: {$in: data.tagged.Todos}}).forEach( function (item) {
        Todos.update(item._id, {$pop: {tags: data.deleted}});
      });

      Habits.find({_id: {$in: data.tagged.Habits}}).forEach( function (item) {
        Habits.update(item._id, {$pop: {tags: data.deleted}});
      });

      Dailies.find({_id: {$in: data.tagged.Dailies}}).forEach( function (item) {
        Dailies.update(item._id, {$pop: {tags: data.deleted}});
      });
    });
});


Template.todo_tags.events({
 'keydown .new-tag, keyup .new-tag, focusout .new-tag' : function (evt) {
    if(evt.type === 'keyup' && evt.which === 27) {
      //cancel
      evt.target.value='';
    } else if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        tag = Tags.findOne({name: value});

        if(tag){
          Tags.update(tag._id, {$addToSet: {'tagged.Todos' : this._id}});
          Todos.update(this._id,
            {$addToSet: { tags: tag._id }});
        } else {
        // tag does note exist, create it!
          tag = Tags.insert({
            name: value,
            userId: Meteor.userId(),
            tagged: { 'Todos': [this._id],
                     'Dailies': [],
                      'Habits': []}
          });
          Todos.update(this._id,
            {$addToSet: {tags: tag}});
        }
        evt.target.value='';
      } else {
       //cancel
        evt.target.value='';
      }
    }
  },
  'click ul.tag-list' : function(evt, template) {
    tmp = template;
    setTimeout(function () {
      tmp.$('input.new-tag').focus();
    }, 1)
  }
});


Template.todo_tags.helpers({
  'tags' : function () {
    if(this.tags && this.tags.length) {
      return Tags.find({_id: {$in: this.tags}});
    }
  }
});

Template.todo_tag.events({
  'click span.remove' : function (evt, template) {
    todo = Todos.findOne(Template.parentData(1)._id);
    tag = Tags.findOne(this._id);

    Todos.update(Template.parentData(1)._id, {$set:{tags:
      _.without(todo.tags, tag._id)
    }});
    Tags.update(this._id, {$set: {'tagged.Todos' :
        _.without(tag.tagged.Todos, todo._id)
      }});

    /*console.log("after removal");
    Tags.find({}).forEach(function(tag) {
      console.log(tag.name);
      console.log(tag.tagged.Todos);
    });*/

    //console.log(Tags.findOne(this._id).tagged.Todos);
  }
});
