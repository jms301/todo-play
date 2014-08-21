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

var activateInput = function (input) {
  input.focus();
  input.select();
};

//Habits

Template.habits.habits= function () { 
  return Habits.find({});
};

Template.habits.events(okCancelEvents(
  '#add-habit',
  {
    ok: function (text, evt) { 
      Habits.insert({
        text: text, 
        done: false, 
        timestamp: (new Date()).getTime(),
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
      Habits.update(this._id, {$set: {done: !this.done}}); 
   }
 });



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
    });
    evt.target.value='';
  }, 
    cancel: function (evt) { 
      evt.target.value='';
    }
 }));

Template.daily_item.ticked = function () { 
  return this.done ? 'ticked' : 'unticked';
};

Template.daily_item.events({
  'click .item-remove': function () { 
      //if(confirm("sure you want to delete that?"))
        Dailies.remove(this._id); 
   },
  'click .item-checkbox': function () { 
      Dailies.update(this._id, {$set: {done: !this.done}}); 
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
        timestamp: (new Date()).getTime(),
      });
      evt.target.value='';
    },   
    cancel: function (evt) {
      evt.target.value='';
    }
  }));

Template.todo_item.ticked = function () { 
  return this.done ? 'ticked' : 'unticked';
};

Template.todo_item.events({
  'click .item-remove': function () { 
      //if(confirm("sure you want to delete that?"))
        Todos.remove(this._id); 
   },
  'click .item-checkbox': function () { 
      Todos.update(this._id, {$set: {done: !this.done}}); 
   }
 });

