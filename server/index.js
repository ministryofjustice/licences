const createApp = require('./app');
const logger = require('../log');

const TokenStore = require('./authentication/tokenStore');
const tokenStore = new TokenStore();

const licenceClient = require('./data/licenceClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');
const pdfFormatter = require('./services/utils/pdfFormatter');

const createSignInService = require('./authentication/signInService');
const createLicenceService = require('./services/licenceService');
const {createPrisonerService} = require('./services/prisonerService');
const createConditionsService = require('./services/conditionsService');
const createCaseListService = require('./services/caseListService');
const createPdfService = require('./services/pdfService');

const signInService = createSignInService(tokenStore);
const licenceService = createLicenceService(licenceClient);
const conditionsService = createConditionsService(licenceClient);
const prisonerService = createPrisonerService(nomisClientBuilder(tokenStore, signInService));
const caseListService = createCaseListService(nomisClientBuilder(tokenStore, signInService), licenceClient);
const pdfService = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter);

const app = createApp({
    logger,
    signInService,
    licenceService,
    prisonerService,
    conditionsService,
    caseListService,
    pdfService,
    tokenStore
});

module.exports = app;
