const bodyParser          = require('body-parser');
const cookieParser        = require('cookie-parser');
const express             = require('express');
const LocalStrategy       = require('passport-local').Strategy;
const passport            = require('passport');
const session             = require('express-session');
var path = require('path');

const app = express();
// tell passport to use a local strategy and tell it how to validate a username and password
var userdatabase = [];


function check(username, password)
{


}
passport.use(new LocalStrategy(
  function(username, password, done) {
    check(username,password);
    //check database to see if username exists
    return done(null, { username: username, password: password });
  }
));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
    done(null, user.username);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(id, done) {
    done(null, { username: id });
});

// tell the express app what middleware to use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/signin', function (req, res) {
res.sendFile('login.html', { root: path.join(__dirname, 'views') });
})



app.get('/health', function (req, res) {
  res.status(200).send('200 OK');
})


app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    // Redirect if it fails
    if (!user) { return res.redirect('/signin'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      // Redirect if it succeeds
      return res.status('200').send( user.username + " , " +  user.password);
    });
  })(req, res, next);
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
//http://stackoverflow.com/questions/22858699/nodejs-and-passportjs-redirect-middleware-after-passport-authenticate-not-being
