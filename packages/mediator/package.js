Package.describe({
  name: 'mediator',
  summary: 'Mediator for tdp intra package communication',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('jquery');
//  api.use('tracker', 'client');
  api.use('underscore', 'client');

  api.addFiles("mediator.js");
  api.export('Mediator');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mediator');
  api.addFiles('mediator-tests.js');
});
