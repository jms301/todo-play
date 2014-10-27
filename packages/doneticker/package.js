Package.describe({
  name: 'doneticker',
  summary: 'TodoPlay Feature - Show a rolling ticker of 10 recently completed & non private todo items.',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.4');
  
  api.use('standard-app-packages');
  api.use('nemo64:bootstrap');
  api.use('less');
  api.use('iron:router@1.0.0-pre4');
  api.use('todoitems'); 
  
  api.addFiles('setup.js', ['client','server']);
  api.addFiles('doneticker.less', 'client');
  api.addFiles('doneticker.html', 'client');
  api.addFiles('doneticker.js', 'client');
  api.addFiles('server.js', 'server');

  //api.export('Config'); // meteor collection 

});

Package.onTest(function(api) {
  //api.use('tinytest');
  //api.use('userconfig');
  //api.addFiles('projects-tests.js');
});
