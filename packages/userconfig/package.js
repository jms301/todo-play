Package.describe({
  name: 'userconfig',
  summary: 'TodoPlay Feature - Allow user config of user options',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.4');
  
  api.use('standard-app-packages');
  api.use('nemo64:bootstrap');
  api.use('less');
  api.use('iron:router@1.0.0-pre4');
  
  api.addFiles('setup.js', ['client','server']);
  api.addFiles('userconfig.less', 'client');
  api.addFiles('userconfig.html', 'client');
  api.addFiles('userconfig.js', 'client');
  api.addFiles('server.js', 'server');

  api.export('DefaultUserConfig'); // object containing a default user config
  api.export('UserConfig'); // meteor collection 

});

Package.onTest(function(api) {
  //api.use('tinytest');
  //api.use('userconfig');
  //api.addFiles('projects-tests.js');
});
