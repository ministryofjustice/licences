const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

function authenticationMiddleware() {
    // eslint-disable-next-line
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    };
}

passport.serializeUser(function(user, done) {
    // Not used but required for Passport
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // Not used but required for Passport
    done(null, user);
});

function init(signInService) {
    const strategy = new LocalStrategy((username, password, done) => {
        signInService
            .signIn(username, password)
            .then(user => done(null, user))
            .catch(error => {
                done(null, false);
            });
    });

    passport.use(strategy);
}

module.exports.init = init;
module.exports.authenticationMiddleware = authenticationMiddleware;
