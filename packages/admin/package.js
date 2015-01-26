Package.describe({
  name: 'admin',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use('standard-app-packages');
  api.use('accounts-password');
  api.use('todolists');
  api.use('less')
  api.use('iron:router');

  api.addFiles('setup.js');
  api.addFiles('admin.html', 'client');
  api.addFiles('admin.js', 'client');
  api.addFiles('server.js', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('admin');
  api.addFiles('admin-tests.js');
});
