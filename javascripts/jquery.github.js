jQuery.githubUser = function(usernames, callback) {
  $.each(usernames, function(index, username) {
    jQuery.getJSON("http://github.com/api/v1/json/" + username + "?callback=?", callback);
  });
}
