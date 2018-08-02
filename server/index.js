const createApp = require('./app');
const logger = require('../log');

const audit = require('./data/audit');

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

const signInService = createSignInService(audit);
const licenceService = createLicenceService(licenceClient);
const conditionsService = createConditionsService(licenceClient);
const prisonerService = createPrisonerService(nomisClientBuilder);
const caseListFormatter = createCaseListFormatter(logger, licenceClient);
const caseListService =
    createCaseListService(nomisClientBuilder, licenceClient, caseListFormatter);
const pdfService = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter);
const searchService = createSearchService(logger, nomisClientBuilder, caseListFormatter);

const app = createApp({
    logger,
    signInService,
    licenceService,
    prisonerService,
    conditionsService,
    caseListService,
    pdfService,
    searchService,
    audit
});

module.exports = app;
