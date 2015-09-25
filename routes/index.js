var express = require('express');
var passport = require('passport');

var router = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');

function authCheck(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

// render the homepage
router.get('/', function(req, res) {
  if(req.isAuthenticated()) {
    var posts = Post.find({ user: req.user._id }).sort('-updated').exec(function(err, result) {
      if(err) return console.error(err);

      if(!result.length) {
        return res.render('newcomer');
      }

      var moment = require('moment');
      res.render('list', { posts: result, moment: moment });
    });
  } else {
    res.render('index', { showSubtitle: true });
  }
});

// new document view
router.get('/new', authCheck, function(req, res) {
	res.render('new', {
    post: {},
    formAction: '/new',
    title: 'New document | Scribe',
    guide: (req.query.getstarted ? true : false)
  });
});

// handle the form post
router.post('/new', authCheck, function(req, res) {
  var errors = new Array();
  var title = req.body.content.split('\n');

  var newPost = new Post();

  newPost.title = title[0];
  newPost.body = req.body.content;
  newPost.private = req.body.private;
  newPost.user = req.user._id;
  newPost.save(function(err, result) {
    if(err) return console.error(err);
    res.redirect('/p/' + result._id);
  });
});

// log out
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// user profile
router.get('/user/:user', function(req, res) {
  var moment = require('moment');

  User.findOne({ username: req.params.user }).populate('posts').exec(function(err, result) {
    if(err) return console.error();
    if(!result) {
      return res.render('404', 404);
    }
    var u = result;
    // get the PUBLIC posts for this user
    var posts = Post.find({ user: result._id, private: {'$ne':true} }).exec(function(err, posts) {
      if(err) return console.error();
      res.render('profile', { posts: posts, u: u, moment: moment });
    });

  });





});

// skribe guide
router.get('/guide', function(req, res) {
  res.render('guide');
});

// about skribe
router.get('/about', function(req, res) {
  res.render('about');
});

// contact form
router.get('/contact', function(req, res) {
  res.render('contact');
});


module.exports = router;
