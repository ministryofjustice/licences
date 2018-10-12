const logger = require('../log.js');
const expressWinston = require('express-winston');
const addRequestId = require('express-request-id')();
const moment = require('moment');

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const flash = require('connect-flash');

const helmet = require('helmet');
const csurf = require('csurf');
const compression = require('compression');
const ensureHttps = require('./utils/ensureHttps');

const sassMiddleware = require('node-sass-middleware');

const config = require('../server/config');
const healthcheck = require('../server/healthcheck');

const passport = require('passport');
const auth = require('./authentication/auth');
const authenticationMiddleware = auth.authenticationMiddleware;

const defaultRouter = require('../server/routes/default');

const adminRouter = require('../server/routes/admin/admin');
const apiRouter = require('../server/routes/api');
const caseListRouter = require('../server/routes/caseList');
const contactRouter = require('../server/routes/contact');
const pdfRouter = require('../server/routes/pdf');
const searchRouter = require('../server/routes/search');
const sendRouter = require('../server/routes/send');
const sentRouter = require('../server/routes/sent');
const taskListRouter = require('./routes/taskList');
const utilsRouter = require('../server/routes/utils');

const addressRouter = require('./routes/address');
const approvalRouter = require('./routes/approval');
const conditionsRouter = require('./routes/conditions');
const curfewRouter = require('./routes/curfew');
const eligibilityRouter = require('./routes/eligibility');
const finalChecksRouter = require('./routes/finalChecks');
const reviewRouter = require('./routes/review');
const reportingRouter = require('./routes/reporting');
const riskRouter = require('./routes/risk');


const version = moment.now().toString();
const production = process.env.NODE_ENV === 'production';

module.exports = function createApp({
                                        logger,
                                        signInService,
                                        licenceService,
                                        prisonerService,
                                        conditionsService,
                                        caseListService,
                                        pdfService,
                                        searchService,
                                        userService,
                                        reportingService,
                                        audit
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
    app.use(bodyParser.urlencoded({extended: true}));

    if (config.enableTestUtils) {
        app.use('/utils/', utilsRouter({logger, licenceService}));
    }

    app.use(cookieParser());
    app.use(csurf({cookie: true}));

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
            debug: false,
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
        res.locals.user = req.user;
        next();
    }

    app.use(addTemplateVariables);

    // Don't cache dynamic resources
    app.use(helmet.noCache());

    // Request logging
    app.use(expressWinston.logger({
        winstonInstance: logger,
        meta: true,
        dynamicMeta: function(req, res) {
            let meta = {
                userEmail: req.user ? req.user.staffId : null,
                requestId: req.id,
                sessionTag: req.user ? req.user.sessionTag : null
            };

            if (res._headers.location) {
                meta.res_header_location = res._headers.location;
            }

            return meta;
        },
        colorize: true,
        requestWhitelist: ['url', 'method', 'originalUrl', 'query', 'body'],
        ignoredRoutes: ['/health', '/favicon.ico']
    }));

    app.use(flash());

    // token refresh
    app.use((req, res, next) => {
        if (req.user) {
            const timeToRefresh = new Date() > req.user.refreshTime;

            if (timeToRefresh) {
                // stash where the user was
                req.session.returnTo = req.originalUrl;
                res.redirect('/login');
                return;
            }
        }
        next();
    });

    // Update a value in the cookie so that the set-cookie will be sent.
    // Only changes every minute so that it's not sent with every request.
    app.use(function(req, res, next) {
        req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
        next();
    });

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

    app.get('/health-detailed', (req, res, next) => {
        healthcheck((err, result) => {
            if (err) {
                return next(err);
            }
            if (!result.healthy) {
                res.status(503);
            }

            res.json(result);
        }, true);
    });

    app.get('/feedback', (req, res) => {
        return res.render('feedback', {returnURL: req.get('referer')});
    });

    if (production) {
        app.use(ensureHttps);
    }

    app.get('/notfound', (req, res) => {
        res.status(404);
        return res.render('notfound');
    });

    const authLogoutUrl = `${config.nomis.authUrl}/logout?client_id=${config.nomis.apiClientId}&redirect_uri=${config.nomis.licencesUrl}`;

    app.get('/autherror', (req, res) => {
        res.status(401);
        return res.render('autherror', {
            authURL: authLogoutUrl
        });
    });

    app.get('/login',
        passport.authenticate('oauth2'));

    app.get('/login/callback',
        passport.authenticate('oauth2', {successReturnToOrRedirect: '/', failureRedirect: '/autherror'}));

    app.use('/logout', (req, res) => {
        if (req.user) {
            req.logout();
        }
        res.redirect(authLogoutUrl);
    });

    app.use('/', defaultRouter());

    app.use('/caseList/', caseListRouter({caseListService, authenticationMiddleware}));
    app.use('/admin/', adminRouter({userService, authenticationMiddleware, audit}));
    app.use('/hdc/contact/', contactRouter({logger, userService, authenticationMiddleware}));
    app.use('/hdc/pdf/', pdfRouter({pdfService, licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/search/', searchRouter({searchService, authenticationMiddleware}));
    app.use('/hdc/send/', sendRouter({licenceService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/sent/', sentRouter({licenceService, prisonerService, authenticationMiddleware}));
    app.use('/hdc/taskList/', taskListRouter({prisonerService, licenceService, caseListService, authenticationMiddleware, audit}));

    app.use('/hdc/', addressRouter({licenceService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', approvalRouter({licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', conditionsRouter({licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', curfewRouter({licenceService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', eligibilityRouter({licenceService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', finalChecksRouter({licenceService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', reviewRouter({licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', reportingRouter({licenceService, conditionsService, prisonerService, authenticationMiddleware, audit}));
    app.use('/hdc/', riskRouter({licenceService, prisonerService, authenticationMiddleware, audit}));

    // hide functionality until authorisation strategy is established
    if (!production) {
        app.use('/api/', apiRouter({reportingService}));
    }

    // Error Handler
    app.use(function(req, res, next) {
        res.redirect('/notfound');
    });

    app.use(handleKnownErrors);
    app.use(renderErrors);

    return app;
};

function handleKnownErrors(error, req, res, next) {

    if (error.code === 'EBADCSRFTOKEN') {
        logger.error('Bad csurf token: ' + error.stack);
    }

    if (error.name === 'NoToken') {
        logger.error('No token found for user');
        return res.redirect('/logout');
    }

    switch (error.status) {
        case 401:
            return res.redirect('/logout');
        case 403:
            logger.error('Unauthorised: ', error.stack);
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
