Mediator;

Mediator = {
  publish: function(name, context) {
    //console.log("published: " + name);
    $(Mediator).trigger(name, context);
  },
  subscribe: function(name, func) {
    //console.log("subscribed: " + name);
    $(Mediator).bind(name, func);
  }
};
