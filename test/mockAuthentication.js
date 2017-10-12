const session = require('cookie-session');
const passport = require('passport');

const auth = require('../server/authentication/auth');

const setupMockAuthentication = (app, signInService) => {
    auth.init(signInService);
    app.use(session({
        secret: 'test',
        resave: false,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());
};

function authenticationMiddleware() {
    return (req, res, next) => next();
}

module.exports.authenticationMiddleware = authenticationMiddleware;
module.exports.setupMockAuthentication = setupMockAuthentication;
