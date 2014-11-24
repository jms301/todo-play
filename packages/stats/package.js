Package.describe({
  name: 'stats',
  summary: 'Todo Play Feature - Stats and charts',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {

  api.versionsFrom('1.0');

  api.use('standard-app-packages');
  api.use('nemo64:bootstrap');
  api.use('less');
  api.use('iron:router');
  api.use('todoplay-base');
  api.use('userconfig');
  api.use('doneticker');
  api.use('mrt:moment');

  api.addFiles('setup.js');
  api.addFiles('stats.less', 'client');
  api.addFiles('stats.html', 'client');
  api.addFiles('stats.js', 'client');
  api.addFiles('server.js', 'server');

  api.export('updateStats');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('stats');
  api.addFiles('stats-tests.js');
});
