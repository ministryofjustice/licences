const passport = require('passport');
const {URLSearchParams} = require('url');
const strategies = require('./authInit');
const LocalStrategy = require('passport-local').Strategy;
const OauthStrategy = require('passport-oauth2').Strategy;
const config = require('../config');
const {generateOauthClientToken} = require('./oauth');

function authenticationMiddleware() {
    // eslint-disable-next-line
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        const redirectPath = '/login';
        const query = req.get('referrer') ? new URLSearchParams({target: req.originalUrl}) : null;
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

function init(signInService, userService, audit, authStrategy) {
    const authStrategies = strategies(signInService, userService, audit);
    const passportStrategies = {
        local: new LocalStrategy(authStrategies.localInit),
        oauth: new OauthStrategy({
            authorizationURL: `${config.nomis.authExternalUrl}/oauth/authorize`,
            tokenURL: `${config.nomis.authUrl}/oauth/token`,
            clientID: config.nomis.apiClientId,
            clientSecret: config.nomis.apiClientSecret,
            callbackURL: `${config.domain}/login/callback`,
            state: true,
            customHeaders: {Authorization: generateOauthClientToken()}
        }, authStrategies.oauthInit)
    };

    passport.use(passportStrategies[authStrategy]);
}

module.exports.init = init;
module.exports.authenticationMiddleware = authenticationMiddleware;
