//setup default profile settings
Accounts.onCreateUser(function(options, user) {
  if(options.profile)
    user.profile = options.profile;
  else
    user.profile = {};

  user.profile.display_name = "Anon";
  user.profile.red_age = 30;
  user.profile.day_end =  0;

  return user;
});
