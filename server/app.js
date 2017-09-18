'use strict';

const logger = require('../log.js');
const expressWinston = require('express-winston');
const addRequestId = require('express-request-id')();
const uuidV1 = require('uuid/v1');
const moment = require('moment');

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const path = require('path');

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const request = require('request');

const helmet = require('helmet');
const csurf = require('csurf');
const compression = require('compression');

const index = require('../routes/index');
const loggedin = require('../routes/loggedin');

const config = require('../server/config');
const healthcheck = require('../server/healthcheck');

const version = moment.now().toString();
const production = process.env.NODE_ENV === 'production';
const testMode = process.env.NODE_ENV === 'test';

//  Express Configuration
const app = express();
app.set('json spaces', 2);


// Configure Express for running behind proxies
// https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true);

// View Engine Configuration
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

// Server Configuration
app.set('port', process.env.PORT || 3000);

// HACK: Azure doesn't support X-Forwarded-Proto so we add it manually
// http://stackoverflow.com/a/18455265/173062
app.use(function(req, res, next) {
    if (req.headers['x-arr-ssl'] && !req.headers['x-forwarded-proto']) {
        req.headers['x-forwarded-proto'] = 'https';
    }
    return next();
});

// Secure code best practice - see:
// 1. https://expressjs.com/en/advanced/best-practice-security.html,
// 2. https://www.npmjs.com/package/helmet
app.use(helmet());

app.use(addRequestId);

app.use(cookieSession({
    name: 'session',
    keys: [config.sessionSecret],
    maxAge: 60 * 60 * 1000,
    secure: config.https,
    httpOnly: true,
    signed: true,
    overwrite: true,
    sameSite: 'lax'
}));

if (testMode) {
    logger.info('Authentication disabled - using default test user profile');
    app.use(dummyUserProfile);
} else {
    logger.info('Authentication enabled');
    enableSSO();
}

// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Resource Delivery Configuration
app.use(compression());

// Cachebusting version string
if (production) {
    // Version only changes on reboot
    app.locals.version = version;
} else {
    // Version changes every request
    app.use(function(req, res, next) {
        res.locals.version = moment.now().toString();
        return next();
    });
}

//  Static Resources Configuration
const cacheControl = {maxAge: config.staticResourceCacheDuration * 1000};

['../public',
    '../govuk_modules/govuk_template/assets',
    '../govuk_modules/govuk_frontend_toolkit'
].forEach(dir => {
    app.use('/public', express.static(path.join(__dirname, dir), cacheControl));
});

[
    '../govuk_modules/govuk_frontend_toolkit/images'
].forEach(dir => {
    app.use('/public/images/icons', express.static(path.join(__dirname, dir), cacheControl));
});

// GovUK Template Configuration
app.locals.asset_path = '/public/';

// Don't cache dynamic resources
app.use(helmet.noCache());

// CSRF protection
if (!testMode) {
    app.use(csurf());
}

// Request logging
app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    dynamicMeta: function(req, res) {
        let meta = {
            userEmail: req.user ? req.user.email : null,
            requestId: req.id,
            sessionTag: req.user ? req.user.sessionTag : null
        };

        if (res._headers.location) {
            meta.res_header_location = res._headers.location;
        }

        return meta;
    },
    colorize: true,
    requestWhitelist: ['url', 'method', 'originalUrl', 'query', 'body']
}));

// Express Routing Configuration
app.get('/health', (req, res, next) => {
    healthcheck((err, result) => {
        if (err) {
            return next(err);
        }
        if (!result.healthy) {
            res.status(503);
        }

        res.json(result);
    });
});

app.use('/', index);

if (!testMode) {
    app.use(authRequired);
    app.use(addTemplateVariables);
}
app.use('/loggedin/', loggedin);

// Error Handler
app.use(function(req, res, next) {
    let error = new Error('Not Found');
    error.status = 404;
    res.render('notfound');
});

app.use(logErrors);
app.use(renderErrors);

function logErrors(error, req, res, next) {
    logger.error('Unhandled error: ' + error.stack);
    next(error);
}

function renderErrors(error, req, res, next) {
    res.locals.error = error;
    res.locals.stack = production ? null : error.stack;
    res.locals.message = production ?
        'Something went wrong. The error has been logged. Please try again' : error.message;

    res.status(error.status || 500);

    res.render('error');
}

//  SSO utility methods
function authRequired(req, res, next) {
    if (!req.user) {
        logger.info('Authorisation required - redirecting to login');
        return res.redirect('/login');
    }
    res.locals.nav = true;
    next();
}

function addTemplateVariables(req, res, next) {
    res.locals.profile = req.user;
    next();
}

function dummyUserProfile(req, res, next) {
    req.user = {
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'Tester',
        profileLink: '/profile',
        logoutLink: '/logout'
    };
    res.locals.profile = req.user;
    next();
}

function enableSSO() {
    const ssoConfig = config.sso;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new OAuth2Strategy({
            authorizationURL: ssoConfig.TOKEN_HOST + ssoConfig.AUTHORIZE_PATH,
            tokenURL: ssoConfig.TOKEN_HOST + ssoConfig.TOKEN_PATH,
            clientID: ssoConfig.CLIENT_ID,
            clientSecret: ssoConfig.CLIENT_SECRET,
            proxy: true // trust upstream proxy
        },
        function(accessToken, refreshToken, profile, cb) {
            logger.info('Passport authentication invoked');

            let options = {
                uri: ssoConfig.TOKEN_HOST + ssoConfig.USER_DETAILS_PATH,
                qs: {access_token: accessToken},
                json: true
            };
            request(options, function(error, response, userDetails) {
                if (!error && response.statusCode === 200) {
                    logger.info('User authentication success');
                    return cb(null, userFor(userDetails));
                } else {
                    logger.error('Authentication failure:' + error);
                    return cb(error);
                }
            });
        })
    );

    function userFor(userDetails) {
        return {
            id: userDetails.id,
            email: userDetails.email,
            firstName: userDetails.first_name,
            lastName: userDetails.last_name,
            profileLink: userDetails.links.profile,
            logoutLink: userDetails.links.logout,
            sessionTag: uuidV1()
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

}

module.exports = app;
