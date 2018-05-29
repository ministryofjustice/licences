const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');
const nock = require('nock');
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
const formConfig = {
    ...licenceConditionsConfig,
    ...eligibilityConfig,
    ...proposedAddressConfig,
    ...curfewConfig,
    ...riskConfig,
    ...reportingConfig,
    ...finalChecksConfig,
    ...approvalConfig
};

const authenticationMiddleware = auth.authenticationMiddleware;
const {
    expect,
    sandbox
} = require('./testSetup');

const testUser = {
    firstName: 'first',
    lastName: 'last',
    staffId: 'id',
    token: 'token',
    role: roles.CA
};

const loggerStub = {
    debug: sandbox.stub(),
    info: sandbox.stub(),
    error: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves(),
    update: sandbox.stub().returnsPromise().resolves(),
    updateLicenceConditions: sandbox.stub().returnsPromise().resolves(),
    deleteLicenceCondition: sandbox.stub().returnsPromise().resolves(),
    markForHandover: sandbox.stub().returnsPromise().resolves(),
    createLicence: sandbox.stub().returnsPromise().resolves(),
    updateAddress: sandbox.stub().returnsPromise().resolves(),
    updateAddresses: sandbox.stub().returnsPromise().resolves(),
    getConditionsErrors: sandbox.stub().returns(),
    getLicenceErrors: sandbox.stub().returns(),
    getEligibilityErrors: sandbox.stub().returns()
};

const conditionsServiceStub = {
    getStandardConditions: sandbox.stub().returnsPromise().resolves(),
    getAdditionalConditions: sandbox.stub().returnsPromise().resolves(),
    formatConditionInputs: sandbox.stub().returnsPromise().resolves(),
    populateLicenceWithConditions: sandbox.stub().returnsPromise().resolves({})
};

const prisonerServiceStub = {
    getEstablishmentForPrisoner: sandbox.stub().returnsPromise().resolves(),
    getComForPrisoner: sandbox.stub().returnsPromise().resolves(),
    getPrisonerDetails: sandbox.stub().returnsPromise().resolves({}),
    getPrisonerImage: sandbox.stub().returnsPromise().resolves({image: 'image'}),
    getPrisonerPersonalDetails: sandbox.stub().returnsPromise().resolves(
        {firstName: 'fn', lastName: 'ln', dateOfBirth: '1980-01-01'})
};

const pdfServiceStub = {
    getPdfLicenceData: sandbox.stub().returnsPromise().resolves(),
    getPdf: sandbox.stub().returnsPromise().resolves(),
    generatePdf: sandbox.stub().returnsPromise().resolves()
};

const hdcRoute = createLicenceConditionsRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    conditionsService: conditionsServiceStub,
    prisonerService: prisonerServiceStub,
    authenticationMiddleware
});

const caseListServiceStub = {
    getHdcCaseList: sandbox.stub().returnsPromise().resolves([])
};

beforeEach(() => {
    sandbox.reset();

    licenceServiceStub.getLicence.resolves({licence: {key: 'value'}});
    prisonerServiceStub.getPrisonerDetails.resolves();
    conditionsServiceStub.getStandardConditions.resolves();
    prisonerServiceStub.getPrisonerDetails.resolves();
    conditionsServiceStub.getAdditionalConditions.resolves();
    pdfServiceStub.getPdfLicenceData.resolves();
});

function testFormPageGets(app, routes) {
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

module.exports = {
    sinon,
    sandbox,
    request,
    expect,
    nock,
    loggerStub,
    licenceServiceStub,
    conditionsServiceStub,
    prisonerServiceStub,
    caseListServiceStub,
    pdfServiceStub,
    hdcRoute,
    formConfig,
    authenticationMiddleware,
    testFormPageGets,
    appSetup: function(route, user = testUser) {

        const app = express();

        app.use((req, res, next) => {
            req.user = user;
            res.locals.user = user;
            next();
        });

        app.use(cookieSession({keys: ['']}));

        app.use(flash());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(route);
        app.set('views', path.join(__dirname, '../server/views'));
        app.set('view engine', 'pug');

        return app;
    }
};
