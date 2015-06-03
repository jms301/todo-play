Meteor.subscribe('todos');
Meteor.subscribe('dailies');
Meteor.subscribe('habits');

if (Meteor.isCordova) {
  Ground.Collection(Meteor.users);
  Ground.Collection(Todos);
  Ground.Collection(Dailies);
  Ground.Collection(Habits);
}

// Messaging channels
var channel = (channel || []);

//returns mid day of the 'day' the user is currently in this is configured by
// the day_end setting so if it is 02:00 on the 9th and their day end is 3am it
// returns 12:00 on the 8th
var whatDayIsThis = function (date) {

  var day_end = 0;
  if(Meteor.user())
    day_end = Meteor.user().profile.day_end;
    return moment(date).subtract(day_end, 'hours').startOf('day'
              ).add(12, 'hours');
};


var isDailyTicked = function (daily) {
  var day_end = 0;
  if(Meteor.user())
    day_end = Meteor.user().profile.day_end;

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

  'keydown div.tdp_add-item>input, keyup div.tdp_add-item>input, focusout div.tdp_add-item>input': function (evt) {
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
    this.$('ul').sortable({
        delay: 150,
        stop: function(e, ui) {
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0)
          before = ui.item.prev().get(0)
          after = ui.item.next().get(0)

          if(!before) {
            newRank = Blaze.getData(after).data.rank - 1
          } else if(!after) {
            newRank = Blaze.getData(before).data.rank + 1
          }
          else
            newRank = (Blaze.getData(after).data.rank +
                       Blaze.getData(before).data.rank)/2

          //update the dragged Item's rank
          Habits.update({_id: Blaze.getData(el).data._id}, {$set: {rank: newRank}});
          $(e.originalEvent.target).one('click', function(e){
            e.stopImmediatePropagation();
          });
        }
    })
};

Template.item.helpers({

  status:  function () {
    if(this.type == "todo") {
      if(this.data.done)
        return "tdp_ticked";
      else
        return "";
    } else if (this.type == "daily") {

    } else if (this.type == "habit") {
        return "";
    }
  },

  color: function () {
    if (this.type == "todo") {
      if(this.data.done){
        return ""
      } else {
        if(Meteor.user())
          red_age = Meteor.user().profile.red_age;

        red_age = (red_age||30);

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

        var age = new Date() - new Date(this.data.timestamp);
        var red_age = red_age * 24 * 60 * 60 * 1000;

        if(age < 0)
          return 'background-color: #779ECB;';
        if(age > red_age)
          age = red_age;

        age_frac = age / red_age;

        var to_ret =  'background-color: rgb(' + Math.floor(rblue - (rdiff * age_frac)) + ',' +
        Math.floor(gblue - (gdiff * age_frac)) + ',' +
        Math.floor(bblue - (bdiff * age_frac)) + ');';

        return to_ret;
      }
    } else if (this.type == "daily") {
      if(isDailyTicked(this.data))
        return 'background-color: #77DD77;';
      else
        return 'background-color: #779ECB;';

    } else if (this.type == "habit") {

      var days = 86400000; //milliseconds in one day;
      var age = new Date() - this.data.ticktime;

      if(age < (this.data.freq/2) * days)
        return 'background-color: #77DD77;';
      else if(age < this.data.freq * days)
        return 'background-color: #779ECB;';
      else
        return 'background-color: #FF7373;';
    }

  },
});


Template.item.events({
  'click .tdp_item': function (evt) {
    if(this.type == "todo") {
      Todos.update(this.data._id, {$set:
                              {done: !this.data.done, ticktime: (new Date())}});
      //updateStats('todos', !this.data.done, this.data.ticktime);

    } else if (this.type == "daily") {
      var is_ticked = isDailyTicked(this.data);
      Dailies.update(this.data._id, {$set:
                      {done: !is_ticked, ticktime: (new Date()).getTime()}});
      //updateStats('dailies', !is_ticked, this.data.ticktime);

    } else if (this.type == "habit") {
      Habits.update(this.data._id, {$set: {ticktime: (new Date()).getTime()}});
      //updateStats('habits', true, null); // habits can only be incremented
      stopProp(evt);
    }

    stopProp(evt);
  },
  'click div.tdp_edit-item, contextmenu .tdp_item': function (evt, template) {

    Session.set('modal_data', this.data);
    Session.set('modal_template', 'edit_' + this.type);

    $('#site-modal').modal('show');

    $('#tdp_edit-title').focus();
    setTimeout(function () {
      $('#tdp_edit-title').focus();
      len = $('#tdp_edit-title').val().length * 2;
      $('#tdp_edit-title')[0].setSelectionRange(len,len);
    }, 900);

    stopProp(evt);
  },

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

  'keydown div.tdp_add-item>input, keyup div.tdp_add-item>input, focusout div.tdp_add-item>input': function (evt) {
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
    this.$('ul').sortable({
        delay: 150,
        stop: function(e, ui) {
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0)
          before = ui.item.prev().get(0)
          after = ui.item.next().get(0)

          if(!before) {
            newRank = Blaze.getData(after).data.rank - 1
          } else if(!after) {
            newRank = Blaze.getData(before).data.rank + 1
          }
          else
            newRank = (Blaze.getData(after).data.rank +
                       Blaze.getData(before).data.rank)/2

          //update the dragged Item's rank
          Dailies.update({_id: Blaze.getData(el).data._id}, {$set: {rank: newRank}});
          $(e.originalEvent.target).one('click', function(e){
            e.stopImmediatePropagation();
          });
        }
    })
};


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
    }
  }
});

Template.todos.events({
  'keydown div.tdp_add-item>input, keyup div.tdp_add-item>input, focusout div.tdp_add-item>input': function (evt) {
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
    this.$('#tdp_todo-list').sortable({
        delay: 150,
        stop: function(e, ui) {
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0);
          before = ui.item.prev().get(0);
          after = ui.item.next().get(0);

          if(!before) {
            newRank = Blaze.getData(after).data.rank - 1;
          } else if(!after) {
            newRank = Blaze.getData(before).data.rank + 1;
          } else {
            newRank = (Blaze.getData(after).data.rank +
                       Blaze.getData(before).data.rank)/2;
          }

          //update the dragged Item's rank
          Todos.update({_id: Blaze.getData(el).data._id}, {$set: {rank: newRank}});

          $(e.originalEvent.target).one('click', function(e){
            e.stopImmediatePropagation();
          });
        }
    })
};

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
  //fires on pressing enter or focusing out of the new tag box.
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
          tag = tag._id;
          Tags.update(tag, {$addToSet: {'tagged.Todos' : this._id}});
        } else {
          // tag does note exist, create it!
          tag = Tags.insert({
            name: value,
            userId: Meteor.userId(),
            tagged: { 'Todos': [this._id],
                     'Dailies': [],
                      'Habits': []}
          });
        }

        Todos.update(this._id, {$addToSet: { tags: tag}});

        //this is a hack since we are using dynamic template + data for the
        //editing modal. :(
        this.tags = this.tags.concat(tag);
        Session.set('modal_data', this);

        evt.target.value='';
      } else {
       //cancel
        evt.target.value='';
      }
    }
  },
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
    todo = Template.parentData(1);
    tag = Tags.findOne(this._id);

    Todos.update(Template.parentData(1)._id, {$set:{tags:
      _.without(todo.tags, tag._id)
    }});
    Tags.update(this._id, {$set: {'tagged.Todos' :
        _.without(tag.tagged.Todos, todo._id)
    }});

    todo.tags = _.without(todo.tags, tag._id);
    setTimeout(function () {
      Session.set('modal_data', todo);
    }, 100);

    /*console.log("after removal");
    Tags.find({}).forEach(function(tag) {
      console.log(tag.name);
      console.log(tag.tagged.Todos);
    });*/
    //console.log(Tags.findOne(this._id).tagged.Todos);
  }
});

var edit_common = {
  'input p.tdp_edit-text>input' : function(evt, template) {
    if(template.$('input').val().length < 30)
      template.$('p.tdp_edit-text>input').css('font-size', '2em');
    else if(template.$('input').val().length < 45)
      template.$('p.tdp_edit-text>input').css('font-size', '1.5em');
    else
      template.$('p.tdp_edit-text>input').css('font-size', '1em');
  },
};

rendered_common = function () {
  template = this;
  if(template.$('input').val().length < 30)
    template.$('p.tdp_edit-text>input').css('font-size', '2em');
  else if(template.$('input').val().length < 45)
    template.$('p.tdp_edit-text>input').css('font-size', '1.5em');
  else
    template.$('p.tdp_edit-text>input').css('font-size', '1em');

}
Template.edit_todo.rendered = rendered_common;
Template.edit_daily.rendered = rendered_common;
Template.edit_habit.rendered = rendered_common;

Template.edit_todo.events(edit_common);
Template.edit_todo.events({
  //enter saves & closes
 'keyup p.tdp_edit-text>input' : function(evt, temp) {
    if(evt.type === 'keyup' && evt.which === 13 ) {
      var value = String(evt.target.value || "");
      if (value) {
        var title_input = temp.$('p.tdp_edit-text>input');
        var notes_input = temp.$('p.tdp_edit-notes>textarea');
        var project_input = temp.$('p.tdp_edit-goals>select>option:selected');
        var private_input = temp.$('label.tdp_edit-private>input');

        Todos.update(this._id, {$set: {notes: notes_input.val(),
                          text: title_input.val(),
                          project: project_input.val(),
                          private: private_input.prop("checked")}});

        $('#site-modal').modal('hide');
      }
    }
    stopProp(evt);

  },
  'typeahead:selected' : function (evt, tmp) {
    value = tmp.$('input.new-tag').val();
    var tag = Tags.findOne({name: value});


    if(tag){
      Tags.update(tag._id, {$addToSet: {'tagged.Todos' : this._id}});
      Todos.update(this._id, {$addToSet: { tags: tag._id }});
    } else {
      // tag does note exist, create it!
      tag = Tags.insert({
        name: value,
        userId: Meteor.userId(),
        tagged: { 'Todos': [this._id],
                 'Dailies': [],
                 'Habits': []}
      });
      Todos.update(this._id, {$addToSet: {tags: tag}});
    }
    tmp.$('input.new-tag').val("");
  },
  'click button#save ' : function (evt, temp) {
    var title_input = temp.$('p.tdp_edit-text>input');
    var notes_input = temp.$('p.tdp_edit-notes>textarea');
    var project_input = temp.$('p.tdp_edit-goals>select>option:selected');
    var private_input = temp.$('label.tdp_edit-private>input');

    Todos.update(this._id, {$set: {notes: notes_input.val(),
                          text: title_input.val(),
                          project: project_input.val(),
                          private: private_input.prop("checked")}});


    $('#site-modal').modal('hide');
  },
  'click button#delete' : function () {
    if(confirm("sure you want to delete this?"))
      Todos.remove(this._id);

    $('#site-modal').modal('hide');
  },
  'click button#later' : function () {
    Session.set('modal_template', 'waiting_modal');
    Session.set('modal_data', this);
  },
  'click button#donow' : function (evt, temp) {

    Todos.update(this._id, {$set: {hide_until: null}});

    $('#site-modal').modal('hide');
  },
  'click button#cancel' : function (evt, temp) {

    $('#site-modal').modal('hide');
  }
});

Template.edit_todo.helpers({
  /*notes: function () {
    console.log("accessed notes");
    console.log(this);
    return this.notes;
  },*/
  waiting_on: function () {
    // it has a hide_until & that value is in the future
    if ( this.hide_until && this.hide_until.getTime() > new Date().getTime()) {
      return true;
    }
    return false;
  },
  is_private: function () {
    if(this.private)  {
      return "checked";
    } else {
      return null;
    }
  }
});

Template.edit_daily.events(edit_common);
Template.edit_daily.events({
  //enter saves & closes
 'keyup p.tdp_edit-text>input' : function(evt, temp) {
    if(evt.type === 'keyup' && evt.which === 13 ) {
      var value = String(evt.target.value || "");
      if (value) {
        var title_input = temp.$('p.tdp_edit-text>input');
        var notes_input = temp.$('p.tdp_edit-notes>textarea');
        var project_input = temp.$('p.tdp_edit-goals>select>option:selected');

        Dailies.update(this._id, {$set: {notes: notes_input.val(),
                          text: title_input.val(),
                          project: project_input.val()}});

        $('#site-modal').modal('hide');
      }
    }
    stopProp(evt);

  },
  'click button#save ' : function (evt, temp) {
    var title_input = temp.$('p.tdp_edit-text>input');
    var notes_input = temp.$('p.tdp_edit-notes>textarea');
    var project_input = temp.$('p.tdp_edit-goals>select>option:selected');

    Dailies.update(this._id, {$set: {notes: notes_input.val(),
                          text: title_input.val(),
                          project: project_input.val()}});

    $('#site-modal').modal('hide');

  },
  'click button#delete' : function () {
    if(confirm("sure you want to delete this?"))
      Dailies.remove(this._id);

    $('#site-modal').modal('hide');

  },
  'click button#cancel' : function (evt, temp) {

    $('#site-modal').modal('hide');
  }
});

Template.edit_habit.events(edit_common);
Template.edit_habit.events({
  //enter saves & closes
 'keyup p.tdp_edit-text>input' : function(evt, temp) {
    if(evt.type === 'keyup' && evt.which === 13 ) {
      var value = String(evt.target.value || "");
      if (value) {
        var title_input = temp.$('p.tdp_edit-text>input');
        var notes_input = temp.$('p.tdp_edit-notes>textarea');
        var project_input = temp.$('p.tdp_edit-goals>select>option:selected');
        var freq_input = temp.$('p.tdp_edit-freq>input');

        Habits.update(this._id, {$set: {notes: notes_input.val(),
                          text: title_input.val(),
                          freq: freq_input.val(),
                          project: project_input.val()}});

        $('#site-modal').modal('hide');
      }
    }
    stopProp(evt);

  },
  'click button#save ' : function (evt, temp) {
    var title_input = temp.$('p.tdp_edit-text>input');
    var notes_input = temp.$('p.tdp_edit-notes>textarea');
    var project_input = temp.$('p.tdp_edit-goals>select>option:selected');
    var freq_input = temp.$('p.tdp_edit-freq>input');

    Habits.update(this._id, {$set: {notes: notes_input.val(),
                          text: title_input.val(),
                          freq: freq_input.val(),
                          project: project_input.val()}});

    $('#site-modal').modal('hide');

  },
  'click button#delete' : function () {
    if(confirm("sure you want to delete this?"))
      Habits.remove(this._id);

    $('#site-modal').modal('hide');

  },
  'click button#cancel' : function (evt, temp) {
    $('#site-modal').modal('hide');
  }
});
