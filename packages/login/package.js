Package.describe({
  name: 'login',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'login screen',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: ''
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('standard-app-packages');
  api.use('twbs:bootstrap');
  api.use('less');

  api.addFiles('setup.js');
  api.addFiles('server.js', 'server');
  api.addFiles('login.less', 'client');
  api.addFiles('login.html', 'client');
  api.addFiles('login.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('login');
  api.addFiles('login-tests.js');
});
