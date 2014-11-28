tagsHandle = Meteor.subscribe('tags', function () {});

Template.tags.events({
  'keydown #new-tag, keyup #new-tag, focusout #new-tag': function (evt) {
    console.log("new tag event");
    if(evt.type === 'keyup' && evt.which === 27) { //esc -> cancel
      //cancel
      evt.target.value='';
    }
    if(evt.type === 'keyup' && evt.which === 13 ||
       evt.type === 'focusout') {
      var value = String(evt.target.value || "");
      if (value) {
        //ok
        console.log("new tag event: ok");

        var tag = Tags.insert({
          name: value,
          userId: Meteor.userId(),
          tagged: [{collection: 'Todos', tagged: []}, 
          {collection: 'Dailies', tagged: []}, 
          {collection: 'Habits', tagged: []}]
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
