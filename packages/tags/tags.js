tagsHandle = Meteor.subscribe('tags', function () {});

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
});

Template.tags.helpers({
  tags: function () {
    if(Meteor.userId()) {
      return Tags.find({});
    }
  }
});

Template.tag.events({
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
  }
});

Template.tag.helpers({

});


