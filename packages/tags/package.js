Package.describe({
  name: 'tags',
  summary: 'TodoPlay Feature - tags for habit/daily/todo items',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.4');

  api.use('standard-app-packages');
  api.use('nemo64:bootstrap');
  api.use('ground:db', 'web.cordova');
  api.use('less');
  api.use('iron:router');
  api.use('sergeyt:typeahead');
  api.use('mediator');

  api.addFiles('setup.js');
  api.addFiles('tags.html', 'client');

  api.addFiles('tags.js', 'client');
  api.addFiles('server.js', 'server');

  api.export('Tags'); // export the collection so todos can read tags when inserting them into Todos
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('tags');
  api.addFiles('tags-tests.js');
});
