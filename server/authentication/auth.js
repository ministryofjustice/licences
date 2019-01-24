const passport = require('passport');
const {URLSearchParams} = require('url');
const strategies = require('./authInit');
const LocalStrategy = require('passport-local').Strategy;
const OauthStrategy = require('passport-oauth2').Strategy;
const config = require('../config');
const {generateOauthClientToken} = require('./oauth');
const logger = require('../../log');

function authenticationMiddleware(signInService) {
    // eslint-disable-next-line
    return async (req, res, next) => {
        if (req.isAuthenticated()) {
            const {role, username, token} = req.user;
            if (role !== 'RO') {
                res.locals.token = token;
                return next();
            }
            try {
                const systemToken = await signInService.getClientCredentialsTokens(username);
                res.locals.token = systemToken.token;
                return next();
            } catch (error) {
                logger.error('Unable to get client credentials token for RO', error.stack);
                return res.redirect('/logout');
            }
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
