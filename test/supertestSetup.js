const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');
const nock = require('nock');
const bodyParser = require('body-parser');
const createLicenceConditionsRoute = require('../server/routes/hdc');
const auth = require('./mockAuthentication');

const licenceConditionsConfig = require('../server/routes/config/licenceConditions');
const eligibilityConfig = require('../server/routes/config/eligibility');
const proposedAddressConfig = require('../server/routes/config/proposedAddress');
const curfewConfig = require('../server/routes/config/curfew');
const reporting = require('../server/routes/config/reporting');
const riskConfig = require('../server/routes/config/risk');
const formConfig = {
    ...licenceConditionsConfig,
    ...eligibilityConfig,
    ...proposedAddressConfig,
    ...curfewConfig,
    ...riskConfig,
    ...reporting
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
    role: 'CA'
};

const loggerStub = {
    debug: sandbox.stub()
};

const licenceServiceStub = {
    getLicence: sandbox.stub().returnsPromise().resolves(),
    update: sandbox.stub().returnsPromise().resolves(),
    updateLicenceConditions: sandbox.stub().returnsPromise().resolves(),
    markForHandover: sandbox.stub().returnsPromise().resolves(),
    createLicence: sandbox.stub().returnsPromise().resolves()
};

const conditionsServiceStub = {
    getStandardConditions: sandbox.stub().returnsPromise().resolves(),
    getAdditionalConditions: sandbox.stub().returnsPromise().resolves(),
    validateConditionInputs: sandbox.stub().returnsPromise().resolves({validates: true}),
    getAdditionalConditionsWithErrors: sandbox.stub().returnsPromise().resolves({})
};

const prisonerServiceStub = {
    getEstablishmentForPrisoner: sandbox.stub().returnsPromise().resolves(),
    getPrisonerDetails: sandbox.stub().returnsPromise().resolves({}),
    getPrisonerImage: sandbox.stub().returnsPromise().resolves({image: 'image'})
};

const hdcRoute = createLicenceConditionsRoute({
    licenceService: licenceServiceStub,
    logger: loggerStub,
    conditionsService: conditionsServiceStub,
    authenticationMiddleware
});

const caseListServiceStub = {
    getHdcCaseList: sandbox.stub().returnsPromise().resolves([])
};

afterEach(() => {
    sandbox.reset();

    licenceServiceStub.getLicence.resolves({licence: {key: 'value'}});
    prisonerServiceStub.getPrisonerDetails.resolves();
    conditionsServiceStub.getStandardConditions.resolves();
    prisonerServiceStub.getPrisonerDetails.resolves();
    conditionsServiceStub.getAdditionalConditions.resolves();
});

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
    hdcRoute,
    formConfig,
    authenticationMiddleware,
    appSetup: function(route, user = testUser) {

        const app = express();

        app.use((req, res, next) => {
            req.user = user;
            res.locals.user = user;
            next();
        });

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(route);
        app.set('views', path.join(__dirname, '../server/views'));
        app.set('view engine', 'pug');

        return app;
    }
};
