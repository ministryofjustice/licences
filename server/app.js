'use strict';

const logger = require('../log.js');
const expressWinston = require('express-winston');
const addRequestId = require('express-request-id')();
const moment = require('moment');

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const path = require('path');

const helmet = require('helmet');
const csurf = require('csurf');
const compression = require('compression');

const sassMiddleware = require('node-sass-middleware');

const config = require('../server/config');
const healthcheck = require('../server/healthcheck');

const passport = require('passport');
const auth = require('./authentication/auth');
const authenticationMiddleware = auth.authenticationMiddleware;

const createSignInRouter = require('./routes/signIn');
const createTasklistRouter = require('../server/routes/tasklist');
const createDetailsRouter = require('../server/routes/prisonerDetails');
const createDischargeAddressRouter = require('../server/routes/dischargeAddress');
const createAdditionalConditionsRouter = require('../server/routes/additionalConditions');
const createLicenceDetailsRouter = require('../server/routes/licenceDetails');
const createReportingRouter = require('../server/routes/reportingInstructions');
const createSendRouter = require('../server/routes/send');
const createSentRouter = require('../server/routes/sent');

const version = moment.now().toString();
const production = process.env.NODE_ENV === 'production';
const testMode = process.env.NODE_ENV === 'test';

module.exports = function createApp({
                                        logger,
                                        signInService,
                                        licenceService,
                                        dischargeAddressService,
                                        prisonerDetailsService,
                                        tasklistService,
                                        conditionsService
                                    }) {
    const app = express();

    auth.init(signInService);

    app.set('json spaces', 2);

    // Configure Express for running behind proxies
    // https://expressjs.com/en/guide/behind-proxies.html
    app.set('trust proxy', true);

    // View Engine Configuration
    app.set('views', path.join(__dirname, '../server/views'));
    app.set('view engine', 'pug');

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

    app.use(passport.initialize());
    app.use(passport.session());

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

    if (!production) {
        app.use('/public', sassMiddleware({
            src: path.join(__dirname, '../assets/sass'),
            dest: path.join(__dirname, '../assets/stylesheets'),
            debug: true,
            outputStyle: 'compressed',
            prefix: '/stylesheets/',
            includePaths: [
                'node_modules/govuk_frontend_toolkit/stylesheets',
                'node_modules/govuk_template_jinja/assets/stylesheets',
                'node_modules/govuk-elements-sass/public/sass'
            ]
        }));
    }

    //  Static Resources Configuration
    const cacheControl = {maxAge: config.staticResourceCacheDuration * 1000};

    [
        '../public',
        '../assets',
        '../assets/stylesheets',
        '../node_modules/govuk_template_jinja/assets',
        '../node_modules/govuk_frontend_toolkit'
    ].forEach(dir => {
        app.use('/public', express.static(path.join(__dirname, dir), cacheControl));
    });

    [
        '../node_modules/govuk_frontend_toolkit/images'
    ].forEach(dir => {
        app.use('/public/images/icons', express.static(path.join(__dirname, dir), cacheControl));
    });

    // GovUK Template Configuration
    app.locals.asset_path = '/public/';

    function addTemplateVariables(req, res, next) {
        res.locals.profile = req.user;
        next();
    }

    app.use(addTemplateVariables);

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

    app.get('/feedback', (req, res) => {
        return res.render('feedback', {returnURL: req.get('referer')});
    });

    app.use('/login', createSignInRouter(passport));

    app.use('/logout', (req, res) => {
        if (req.user) {
            req.logout();
            res.redirect('/login');
        } else {
            res.redirect('/login');
        }
    });

    app.use('/', createTasklistRouter({logger, tasklistService, authenticationMiddleware}));
    app.use('/details/',
        createDetailsRouter({logger, prisonerDetailsService, licenceService, authenticationMiddleware}));
    app.use('/dischargeAddress/',
        createDischargeAddressRouter({logger, dischargeAddressService, licenceService, authenticationMiddleware}));
    app.use('/additionalConditions/', createAdditionalConditionsRouter({logger, conditionsService}));
    app.use('/licenceDetails/', createLicenceDetailsRouter({logger, licenceService, authenticationMiddleware}));
    app.use('/reporting/', createReportingRouter({logger, licenceService, authenticationMiddleware}));
    app.use('/send/', createSendRouter({logger, licenceService, authenticationMiddleware}));
    app.use('/sent/', createSentRouter({logger, licenceService, authenticationMiddleware}));

    // Error Handler
    app.use(function(req, res, next) {
        res.status(404);
        res.render('notfound');
    });

    app.use(handleKnownErrors);
    app.use(renderErrors);

    return app;
};

function handleKnownErrors(error, req, res, next) {

    if (error.code === 'EBADCSRFTOKEN') {
        logger.error('Bad csurf token: ' + error.stack);
    }

    switch (error.status) {
        case 401:
            return res.redirect('/logout');
        case 403:
            return res.redirect('/logout');
        default:
            next(error);
    }
}

function renderErrors(error, req, res, next) {
    logger.error('Unhandled error: ' + error.stack);

    res.locals.error = error;
    res.locals.stack = production ? null : error.stack;
    res.locals.message = production ?
        'Something went wrong. The error has been logged. Please try again' : error.message;

    res.status(error.status || 500);

    res.render('error');
}
