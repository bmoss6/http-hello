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
  console.log("Checking to see if username exists!");
  console.log(userdatabase);
  

  if (userdatabase.length == 0)
  {
    var userob = new Object();
    userob.username= username;
    userob.password = password;
    userob.keypair = {};
    userdatabase.push(userob);
    return userob;
  }

  else
  {
    console.log("Checking for the username here!");
      for (var x = 0;  x <userdatabase.length; x ++)
      {
        if(username == userdatabase[x].username)
        {
          console.log("Username: " + username + " exists!");
            return userdatabase[x];
        }

      }
      var userob = new Object();
      userob.username= username;
      userob.passwords = [];
      userob.passwords.push(password);
      userob.keypair = {};
      userdatabase.push(userob);
      return userob;

  }

}
passport.use(new LocalStrategy(
  function(username, password, done) {
    var userob = check(username,password);
    //check database to see if username exists
    return done(null, { username: userob.username, password: userob.password, keypair: userob.keypair });
  }
));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
  //console.log('serialize');
  //console.log(user);
    done(null, {username :user.username, password: user.password, keypair: user.keypair});
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(user ,done) {
  //console.log('deserialize');
  //console.log(user);
    done(null, { username: user.username, password: user.password, keypair: user.keypair });
});

// tell the express app what middleware to use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/signin', function (req, res) {
  if(req.user)
  {
    res.redirect('/logout');
  }
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
    //  console.log("Getting Info!");
    console.log("Login page called. !! Showing keypair below!");
    console.log(req.user.keypair);
      return res.status('200').send(user.keypair);
    });
  })(req, res, next);
});

app.get('/logout', function(req, res){
  console.log('logout');
  req.logout();
  res.redirect('/signin');
});

app.get('/', function(req, res){

if (req.user)
{
  //  console.log(" / page called!! showing req.user below");
  //  console.log(req.user);
  return res.status('200').send(req.user.keypair);

}
else
{
  return res.status('401').send("Not logged in! Go to /signin!");
}
});

app.put('/', function(req, res){

  if (!req.user)
  {
    return res.status('401').send("Not logged in! Go to /signin!");
  }
  else {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
  var key = query.key;
  var value = query.value;
  //  console.log(query);
    console.log("In PUT function: " + key);

    req.user.keypair[key] = value;
      console.log(req.user.keypair);

      return res.status('200').send(req.user.keypair);
  }

});


app.delete('/', function(req, res){

  if (!req.user)
  {
    return res.status('401').send("Not logged in! Go to /signin!");
  }
  else {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var key = query.key;
    console.log("IN DELETE FUNCTION!!");
    console.log("Here is the key " + key);
    if(key in req.user.keypair)
    {
      console.log("found the key!");
      delete req.user.keypair[key];
      console.log("Deleted " + key);
      console.log(req.user.keypair);
    }
    return res.status('200').send(req.user.keypair);
  }

});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
//http://stackoverflow.com/questions/22858699/nodejs-and-passportjs-redirect-middleware-after-passport-authenticate-not-being
