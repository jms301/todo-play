stopProp = function (evt) {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  } else {
    evt.cancelBubble = true;
  }
};

Template.registerHelper("isCordova", function () {
      return Meteor.isCordova;
});

