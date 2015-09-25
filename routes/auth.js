var express = require('express');
var passport = require('passport');
var router = express.Router();

// send the request
router.get('/login', passport.authenticate('twitter'));

// destroy session
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// handle the callback after twitter has authenticated the user
router.get(
    '/twitter/callback',
    passport.authenticate('twitter', {
    	successRedirect : '/',
    	failureRedirect : '/auth/fail'
    })
);



module.exports = router;
