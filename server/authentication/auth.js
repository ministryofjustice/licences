const passport = require('passport');
const Strategy = require('passport-oauth2').Strategy;
const {URLSearchParams} = require('url');
const config = require('../config');
const {generateOauthClientToken} = require('./oauth');

function authenticationMiddleware() {
    // eslint-disable-next-line
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        const redirectPath = '/login';
        const query = req.get('referrer') ? new URLSearchParams({target: req.get('referrer')}) : null;
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
    const strategy = new Strategy({
            authorizationURL: `${config.nomis.authUrl}/oauth/authorize`,
            tokenURL: `${config.nomis.authUrl}/oauth/token`,
            clientID: config.nomis.apiClientId,
            clientSecret: config.nomis.apiClientSecret,
            callbackURL: `${config.nomis.licencesUrl}/login/callback`,
            state: true,
            customHeaders: {Authorization: generateOauthClientToken()}
        },
        async (accessToken, refreshToken, params, profile, done) => {
            try {
                const user = await signInService.signIn(accessToken, refreshToken, params.expires_in, params.user_name);
                return done(null, user);
            } catch (error) {
                return done(null, false, {message: 'A system error occurred; please try again later'});
            }
        });

    passport.use(strategy);
}

module.exports.init = init;
module.exports.authenticationMiddleware = authenticationMiddleware;
