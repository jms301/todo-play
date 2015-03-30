Package.describe({
  name: 'projects',
  summary: 'TodoPlay Feature - Create a drop down for selecting projects',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.4');

  api.use('standard-app-packages');
  api.use('twbs:bootstrap');
  api.use('less');
  api.use('iron:router');
  api.use('ground:db', 'web.cordova');


  api.addFiles('projects.less', 'client');
  api.addFiles('projects.html', 'client');
  api.addFiles('projects.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('projects');
  api.addFiles('projects-tests.js');
});
