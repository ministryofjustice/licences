const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

function authenticationMiddleware() {
    // eslint-disable-next-line
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/signin');
    };
}

passport.serializeUser(({forename, surname}, done) => done(null, `${forename} ${surname}`));

passport.deserializeUser((username, done) => {
    const name = username.split(' ');
    done(null, {forename: name[0], surname: name[1]});
});

function init(signInService) {
    const strategy = new LocalStrategy((username, password, done) => {
        signInService
            .signIn(username, password)
            .then(user => done(null, user))
            .catch(done);
    });

    passport.use(strategy);
}

module.exports.init = init;
module.exports.authenticationMiddleware = authenticationMiddleware;
