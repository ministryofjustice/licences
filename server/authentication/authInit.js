const fiveMinutesBefore = require('../utils/fiveMinutesBefore');
const allowedRoles = require('./roles');
const logger = require('../../log');

module.exports = function(signInService, userService, audit) {

    async function localInit(username, password, done) {
        try {
            const {token, refreshToken, expiresIn} = await signInService.signIn(username, password);
            if (!token) {
                return done(null, false, {message: 'Incorrect username or password'});
            }
            const user = await getUser(token, refreshToken, expiresIn, username);
            return done(null, user);

        } catch (error) {
            logger.error('Sign in error ', error.stack);
            return done(null, false, {message: 'A system error occurred; please try again later'});
        }
    }

    async function oauthInit(accessToken, refreshToken, params, profile, done) {
        try {
            const user = await getUser(accessToken, refreshToken, params.expires_in, params.user_name);
            return done(null, user);
        } catch (error) {
            logger.error('Sign in error ', error.stack);
            return done(null, false, {message: 'A system error occurred; please try again later'});
        }
    }

    async function getUser(token, refreshToken, expiresIn, username) {
        const userProfile = await userService.getUserProfile(token, refreshToken, username);

        if (!allowedRoles.includes(userProfile.role)) {
            throw new Error('Login error - no acceptable role');
        }

        const userDetail = userProfile.staffId || userProfile.username || userProfile.lastName || 'no user id';
        audit.record('LOGIN', userDetail);

        return {
            token,
            refreshToken,
            expiresIn,
            refreshTime: fiveMinutesBefore(expiresIn),
            ...userProfile
        };
    }

    return {
        localInit,
        oauthInit
    };
};
