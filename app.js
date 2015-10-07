var https = require('https');
var express = require('express');
var flash = require('express-flash');
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var posts = require('./routes/posts');
var auth = require('./routes/auth');

var Post = require('./models/post.js');
var User = require('./models/user.js');

var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy;

var app = express();

// get the correct configuration setting
if (app.get('env') === 'development') {
  var config = require('./config/development.js');
} else {
  var config = require('./config/production.js');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// configure mongoose connection
console.log(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGOLAB_URI);

app.use(
  session({
    secret: 'callumbonnyman',
    cookie: { maxAge: 3600000 },
    resave: false,
    saveUninitialized: false,
    auto_reconnect: true,
    store: new MongoStore({
        db: mongoose.connection.db
    })
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
})

app.use('/', routes);
app.use('/p', posts);
app.use('/auth', auth);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// debug error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// passport authentication
passport.use(new TwitterStrategy({
    consumerKey: config.twitterConsumerKey,
    consumerSecret: config.twitterConsumerSecret,
    callbackURL: config.twitterCalbackUrl
  },
  function(token, tokenSecret, profile, done) {

    console.log(profile._json);
    // var p = profile;
    // console.log(p);

    User.findOne({ 'uid': profile.id }, function(err, result) {
      if (err)
        return done(err);

      // get the original size image url
      var image_url = profile._json.profile_image_url.replace('_normal','');

      // user was found
      if(result) {
        // update any details we need
        result.displayName = profile.displayName;
        result.username = profile.username;
        result.profile_image_url = image_url;
        result.profile_small_image_url = profile._json.profile_image_url;
        result.location = profile._json.location;
        // console.log(p);


        result.save(function(err, result) {
          if(err) return done(err);
          // log in
          return done(null, result);
        });
      } else {
        // create a new user
        var newUser =  new User();
        // store the data
        newUser.uid = profile.id;
        newUser.token = token;
        newUser.username = profile.username;
        newUser.displayName = profile.displayName;
        newUser.profile_image_url = image_url;
        newUser.profile_small_image_url = profile._json.profile_image_url;
        newUser.location = profile._json.location;
        // save the data
        newUser.save(function(err) {
          if(err)
            throw err;
          return done(null, newUser);
        });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = app;
