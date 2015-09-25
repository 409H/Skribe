var mongoose = require('mongoose');

var User = mongoose.model('User', {
  uid: String,
  token: String,
  displayName: String,
  username: String,
  profile_image_url: String,
  profile_small_image_url: String,
  location: String
});

module.exports = User;
