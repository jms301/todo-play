Session.setDefault('with_tags', []);
Session.setDefault('without_tags', []);

tagsHandle = Meteor.subscribe('tags', function () {});


if (Meteor.isCordova) {
  Ground.Collection(Tags);
}


Template.tags.events({
  'keydown #new-tag, keyup #new-tag, focusout #new-tag': function (evt) {
    if(evt.type === 'keyup' && evt.which === 27) { //esc -> cancel
      //cancel
      evt.target.value='';
    }
    if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok

        var tag = Tags.insert({
          name: value,
          userId: Meteor.userId(),
          tagged: { 'Todos': [],
                    'Dailies': [],
                    'Habits': []}
        });
        evt.target.value='';
      } else {
        //cancel
        evt.target.value='';
      }
    }
    stopProp(evt);
  },
  'click ul.tag-list' : function(evt) {
    setTimeout(function () {
      $('input#new-tag').focus()
    }, 1)
  }
});

Template.tags.helpers({
  tags: function () {
    if(Meteor.userId()) {
      return Tags.find({});
    }
  }

});

Template.tag.events({
  "click li" : function (evt) {
    var with_tags = Session.get("with_tags");
    var without_tags = Session.get("without_tags");

    /*console.log("with_tags:");
    console.log(with_tags);
    console.log("without_tags:");
    console.log(without_tags); */

    if(_.contains(with_tags, this._id)) {
      Session.set("with_tags", _.without(with_tags, this._id));
      Session.set("without_tags", without_tags.concat(this._id));
    } else if (_.contains(without_tags, this._id)) {
      Session.set("without_tags", _.without(without_tags, this._id));
    } else {
      Session.set("with_tags", with_tags.concat(this._id));
    }
    stopProp(evt);
  },

  "click span.remove" : function (evt) {
    if(this.tagged.Todos.length != 0 ||
       this.tagged.Dailies != 0 ||
       this.tagged.Habits != 0) {
      if(!confirm("The tag " + this.name + " is in use! Are you sure you want to delete it? (Tagged items we be de-tagged)")) {
        return;
      }
    }
    Mediator.publish('delete_tag', {
        tagged: this.tagged,
        deleted: this._id});
    Tags.remove(this._id);
    Session.set("with_tags", _.without(Session.get("with_tags"), this._id));
    Session.set("without_tags",
                  _.without(Session.get("without_tags"), this._id));
  }
});

Template.tag.helpers({
  filters: function () {
    if (_.contains(Session.get("with_tags"), this._id)) {
      return "label-success"
    }
    if (_.contains(Session.get("without_tags"), this._id)) {
      return "label-danger"
    }
    return "label-info"
  }
});

Template.todo_tags.helpers({
  autocomplete: function () {
    return Tags.find().fetch().map(function(tag) { return tag.name; });
  }
});

Template.todo_tags.rendered = function () {
  var element = this.$('input.typeahead');
  Meteor.typeahead(element);
};

Template.todo_tags.events({
  'click ul.tag-list, dblclick ul.tag-list' : function (evt, tmp) {
    setTimeout(function () {
      tmp.$('input.new-tag').focus();
    }, 1)

    stopProp(evt);
  }
});
