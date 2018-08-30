const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {isEmpty} = require('../utils/functionalHelpers');
const {URLSearchParams} = require('url');

function authenticationMiddleware() {
    // eslint-disable-next-line
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        const redirectPath = '/login';
        const query = new URLSearchParams({target: req.get('referrer')});
        const redirectUrl = query ? redirectPath + '?' + query : redirectPath;
        return res.redirect(redirectUrl);
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
    const strategy = new LocalStrategy(async (username, password, done) => {
        try {
            const user = await signInService.signIn(username, password);

            if (isEmpty(user)) {
                return done(null, false, {message: 'Incorrect username or password'});
            }

            return done(null, user);
        } catch (error) {
            return done(null, false, {message: 'A system error occured; please try again later'});
        }
    });

    passport.use(strategy);
}

module.exports.init = init;
module.exports.authenticationMiddleware = authenticationMiddleware;
