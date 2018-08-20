const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const createLicenceConditionsRoute = require('../server/routes/hdc');
const auth = require('./mockAuthentication');

const cookieSession = require('cookie-session');
const flash = require('connect-flash');

const {roles} = require('../server/models/roles');

const licenceConditionsConfig = require('../server/routes/config/licenceConditions');
const eligibilityConfig = require('../server/routes/config/eligibility');
const proposedAddressConfig = require('../server/routes/config/proposedAddress');
const curfewConfig = require('../server/routes/config/curfew');
const reportingConfig = require('../server/routes/config/reporting');
const riskConfig = require('../server/routes/config/risk');
const finalChecksConfig = require('../server/routes/config/finalChecks');
const approvalConfig = require('../server/routes/config/approval');
const createPdfConfig = require('../server/routes/config/createPdf');
const formConfig = {
    ...licenceConditionsConfig,
    ...eligibilityConfig,
    ...proposedAddressConfig,
    ...curfewConfig,
    ...riskConfig,
    ...reportingConfig,
    ...finalChecksConfig,
    ...approvalConfig,
    ...createPdfConfig
};

const authenticationMiddleware = auth.authenticationMiddleware;

const testUser = {
    firstName: 'first',
    lastName: 'last',
    staffId: 'id',
    token: 'token',
    role: roles.CA
};

const loggerStub = {
    debug: sinon.stub(),
    info: sinon.stub(),
    error: sinon.stub()
};

const auditStub = {
    record: sinon.stub()
};

const signInServiceStub = {
    signIn: sinon.stub().resolves(),
    refresh: sinon.stub().resolves()
};

const createLicenceServiceStub = () => ({
    getLicence: sinon.stub().resolves({licence: {key: 'value'}}),
    update: sinon.stub().resolves(),
    updateLicenceConditions: sinon.stub().resolves(),
    deleteLicenceCondition: sinon.stub().resolves(),
    markForHandover: sinon.stub().resolves(),
    createLicence: sinon.stub().resolves(),
    updateAddress: sinon.stub().resolves(),
    updateAddresses: sinon.stub().resolves(),
    getConditionsErrors: sinon.stub().returns(),
    getLicenceErrors: sinon.stub().returns(),
    getEligibilityErrors: sinon.stub().returns(),
    getValidationErrorsForReview: sinon.stub().returns({}),
    addAddress: sinon.stub().resolves(),
    getValidationErrorsForPage: sinon.stub().returns({})
});

const createConditionsServiceStub = () => ({
    getStandardConditions: sinon.stub().resolves(),
    getAdditionalConditions: sinon.stub().resolves(),
    formatConditionInputs: sinon.stub().resolves(),
    populateLicenceWithConditions: sinon.stub().resolves({})
});

const createPrisonerServiceStub = () =>({
    getEstablishmentForPrisoner: sinon.stub().resolves(),
    getComForPrisoner: sinon.stub().resolves(),
    getPrisonerDetails: sinon.stub().resolves({}),
    getPrisonerImage: sinon.stub().resolves({image: 'image'}),
    getPrisonerPersonalDetails: sinon.stub().resolves(
        {firstName: 'fn', lastName: 'ln', dateOfBirth: '1980-01-01'})
});

const pdfServiceStub = {
    getPdfLicenceData: sinon.stub().resolves(),
    getPdf: sinon.stub().resolves(),
    generatePdf: sinon.stub().resolves()
};

const searchServiceStub = {
    searchOffenders: sinon.stub().resolves()
};

const createHdcRoute = overrides => createLicenceConditionsRoute({
    licenceService: createLicenceServiceStub(),
    logger: loggerStub,
    conditionsService: createConditionsServiceStub(),
    prisonerService: createPrisonerServiceStub(),
    authenticationMiddleware,
    audit: auditStub,
    ...overrides
});

const caseListServiceStub = {
    getHdcCaseList: sinon.stub().resolves([])
};

function testFormPageGets(app, routes, licenceServiceStub) {
    context('licence exists for nomisId', () => {
        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
                return request(app)
                    .get(route.url)
                    .expect(200)
                    .expect('Content-Type', /html/)
                    .expect(res => {
                        expect(res.text).to.contain(route.content);
                    });
            });
        });
    });

    context('licence doesnt exists for nomisId', () => {
        beforeEach(() => {
            licenceServiceStub.getLicence.resolves(null);
        });
        routes.forEach(route => {
            it(`renders the ${route.url} page`, () => {
                return request(app)
                    .get(route.url)
                    .expect(302)
                    .expect(res => {
                        expect(res.header.location).to.equal('/');
                    });
            });
        });
    });
};

const setup = {
    loggerStub,
    auditStub,
    signInServiceStub,
    createLicenceServiceStub,
    createConditionsServiceStub,
    createPrisonerServiceStub,
    caseListServiceStub,
    pdfServiceStub,
    searchServiceStub,
    createHdcRoute,
    formConfig,
    authenticationMiddleware,
    testFormPageGets,
    createApp(opts, user = testUser) {
        const hdcRoute = createHdcRoute({...opts});

        return setup.appSetup(hdcRoute, user);
    },
    appSetup(route, user = testUser, prefix = '') {
        const app = express();

        app.set('views', path.join(__dirname, '../server/views'));
        app.set('view engine', 'pug');

        app.use((req, res, next) => {
            req.user = user;
            res.locals.user = user;
            next();
        });
        app.use(cookieSession({keys: ['']}));
        app.use(flash());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(prefix, route);

        return app;
    }
};

module.exports = setup;
