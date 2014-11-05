var doneTickerHandle = Meteor.subscribe('done_ticker', function () { 
 
}); 

Session.setDefault('ticker_active', null);
Session.setDefault('ticker_count', null);


// update the done ticker every 10 seconds
Meteor.setInterval(function () {
  Session.set('ticker_active', (Session.get('ticker_active') * -1));
  Meteor.setTimeout(function () {
    next = Math.abs(Session.get('ticker_active')) + 1;
    if( next >= Session.get('ticker_count'))
      next = 1;
    Session.set('ticker_active', (next * -1));

    Meteor.setTimeout(function () {
      Session.set('ticker_active', (Session.get('ticker_active') * -1));
    }, 2000);
  }, 2000);
}, 10000);


Template.doneticker.helpers({ 
    ticker_active: function (index) {
    if (Session.get('ticker_active') == index ) {
      return '';
    } else if (Session.get('ticker_active') == (-1 * index)) {
      return 'hiding';
    } else {
      return 'hidden';
    }
  },
  tickers: function () {
    tickers = DoneTicker.find();
    Session.set('ticker_count', tickers.count() + 1);
    Session.set('ticker_active', 1);
  
    return DoneTicker.find({}).map(function(doc, index) {
                                 doc.index = index + 1;
                                 return doc;
                               });
  }
});
