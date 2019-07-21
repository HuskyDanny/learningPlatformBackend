const passport = require("passport");
const { User } = require("../models/Users");
const LocalStrategy = require("passport-local");

//note localstrategy, here we need to parse user[username], because we post in a user{username, password} form
passport.use(
  new LocalStrategy(
    { usernameField: "user[email]", passwordField: "user[password]" },
    function(email, password, done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, null);
        }
        if (!user.validatePassword(password)) {
          return done(null, false, {
            message: "Incorrect Password "
          });
        }
        return done(null, user);
      });
    }
  )
);

//Instead I uses JWT
// passport.serializeUser(function(user, done) {
//   done(null, user._id);
// });

// passport.deserializeUser(async function(id, done) {
//   await User.findOne(id, (err, user) => {
//     done(err, user);
//   });
// });
