Package.describe({
  name: 'todolists',
  summary: 'TodoPlay Feature - Show lists of todos',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use('standard-app-packages');
  api.use('twbs:bootstrap');
  api.use('less');
  api.use('iron:router');
  api.use('ground:db', 'web.cordova');
  api.use('mediator');
  api.use('projects');
  api.use('tags');

  api.addFiles('setup.js'); // shared setup for collections
  api.addFiles('todolists.less', 'client');
  api.addFiles('todolists.html', 'client');
  api.addFiles('todolists.js', 'client');
  api.addFiles('server.js', 'server');

  api.export('Habits');
  api.export('Todos');
  api.export('Dailies');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('todolists');
  api.addFiles('todolists-tests.js');
});
