Session.setDefault('edit_todo_id', null);
Session.setDefault('edit_daily_id', null);
Session.setDefault('edit_habit_id', null);

var cancelEdit = function (id, List) { 
  if(id) {
    title_input = $('#item-title-' + id);
    notes_input = $('#item-notes-' + id);
    item = List.findOne({_id: id});
  
    title_input.val(item.text);
    notes_input.val(item.notes);
 } 
}; 

var saveEdit = function (id, List) { 
  title_input = $('#item-title-' + id);
  notes_input = $('#item-notes-' + id);
  List.update(id, {$set: {notes: notes_input.val(), text: title_input.val()}});

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
      cancelEdit(Session.get('edit_todo_id'), Todos);
      cancelEdit(Session.get('edit_daily_id'), Dailies);
      cancelEdit(Session.get('edit_habit_id'), Habits);
      Session.set('edit_todo_id', null);
      Session.set('edit_daily_id', null);
      Session.set('edit_habit_id', null);
      
    }   // esc
});

UI.body.events({'click' : function (evt)  { 
    saveEdit(Session.get('edit_todo_id'), Todos);
    saveEdit(Session.get('edit_daily_id'), Dailies);
    saveEdit(Session.get('edit_habit_id'), Habits);
    Session.set('edit_todo_id', null);
    Session.set('edit_daily_id', null);
    Session.set('edit_habit_id', null);
}});

//Habits

Template.habits.habits= function () { 
  return Habits.find({});
};

Template.habits.events(okCancelEvents(
  '#add-habit',
  {
    ok: function (text, evt) { 
      Habits.insert({
        ticktime: (new Date(0)),
        text: text, 
        done: false, 
        timestamp: (new Date()).getTime(),
        freq: 7 //default frequency is once per week  
    });
    evt.target.value='';
  }, 
    cancel: function (evt) { 
      evt.target.value='';
    }
 }));

Template.habit_item.ticked = function () { 
  return this.done ? 'ticked' : 'unticked';
};

Template.habit_item.events({
  'click .item-remove': function () { 
      //if(confirm("sure you want to delete that?"))
        Habits.remove(this._id); 
   },
  'click .item-checkbox': function () { 
      Habits.update(this._id, {$set: {done: !this.done, ticktime: (new Date()).getTime()}}); 
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

//Dailies

Template.dailies.dailies = function () { 
  return Dailies.find({});
};

Template.dailies.events(okCancelEvents(
  '#add-daily',
  {
    ok: function (text, evt) { 
      Dailies.insert({
        text: text, 
        done: false, 
        timestamp: (new Date()).getTime(),
        ticktime: (new Date(0))
    });
    evt.target.value='';
  }, 
    cancel: function (evt) { 
      evt.target.value='';
    }
 }));

Template.daily_item.ticked = function () { 
  if (this.done && (this.ticktime > new Date(new Date().toDateString()).getTime() ))
    return 'ticked';
  else
    return 'unticked';
};

Template.daily_item.events({
  'click .item-remove': function () { 
      //if(confirm("sure you want to delete that?"))
        Dailies.remove(this._id); 
   },
  'click .item-checkbox': function () { 
      Dailies.update(this._id, {$set: {done: !this.done, ticktime: (new Date()).getTime()}}); 
   }
 });


//Todos 
Template.todos.todos = function () { 
  return Todos.find({}, {sort: [["done"], ["timestamp", "desc"] ]});
};

Template.todos.events(okCancelEvents(
  '.add-item-text',
  {
    ok: function (text, evt) { 
      Todos.insert({
        text: text, 
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

Template.todo_item.ticked = function () { 
  return this.done ? 'ticked' : 'unticked';
};

Template.todo_item.events({
  'click .item-remove': function () { 
      //if(confirm("sure you want to delete that?"))
        Todos.remove(this._id); 
  },
  'click li': function (evt) { 
    if (evt.stopPropagation) {
      evt.stopPropagation();
    } else {
      evt.cancelBubble = true;
    }
  },
  'click .cancel-edit': function () { 
      cancelEdit(this._id, Todos);
      Session.set('edit_todo_id', null);
  },
  'click .item-checkbox': function () { 
    Todos.update(this._id, {$set: {done: !this.done}}); 
  },
  'dblclick .item-text': function (evt) { 
    if(Session.get('edit_todo_id') != this._id)
      Session.set('edit_todo_id', this._id);
    else {
      Session.set('edit_todo_id', null);
      saveEdit(this._id, Todos);
    }

    if (evt.stopPropagation) {
      evt.stopPropagation();
    } else {
      evt.cancelBubble = true;
    }
  },
  'dblclick .item-edit-title, dblclick .item-edit-notes' : function(evt) { 
    if (evt.stopPropagation) {
      evt.stopPropagation();
    } else {
      evt.cancelBubble = true;
    }
  }
});

Template.todo_item.editing = function () { 
  return this._id == Session.get('edit_todo_id') ? "editing" : "";
};

