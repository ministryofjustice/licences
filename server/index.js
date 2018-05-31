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
const createSearchService = require('./services/searchService');
const createCaseListFormatter = require('./services/utils/caseListFormatter');

const signInService = createSignInService(tokenStore);
const licenceService = createLicenceService(licenceClient);
const conditionsService = createConditionsService(licenceClient);
const prisonerService = createPrisonerService(nomisClientBuilder(tokenStore, signInService));
const caseListFormatter = createCaseListFormatter(logger, licenceClient);
const caseListService = createCaseListService(nomisClientBuilder(tokenStore, signInService), licenceClient, caseListFormatter);
const pdfService = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter);
const searchService = createSearchService(logger, nomisClientBuilder(tokenStore), caseListFormatter);

const app = createApp({
    logger,
    signInService,
    licenceService,
    prisonerService,
    conditionsService,
    caseListService,
    pdfService,
    searchService,
    tokenStore
});

module.exports = app;
