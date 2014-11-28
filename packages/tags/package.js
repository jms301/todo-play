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
  api.use('less');
  api.use('iron:router');

  api.addFiles('setup.js');
  api.addFiles('tags.html', 'client');
  api.addFiles('tags.js', 'client');
  api.addFiles('server.js', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('tags');
  api.addFiles('tags-tests.js');
});
