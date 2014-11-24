Package.describe({
  name: 'todoplay-base',
  summary: 'todoplay library shared css etc',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('less');
  api.addFiles('todoplay-base.less');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('todoplay-base');
  api.addFiles('todoplay-base-tests.js');
});
