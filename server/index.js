const createApp = require('./app');
const logger = require('../log');
const licenceClient = require('./data/licenceClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');

const createSignInService = require('./authentication/signIn');
const createLicenceService = require('./services/licenceService');
const {createPrisonerService} = require('./services/prisonerService');
const createConditionsService = require('./services/conditionsService');
const createCaseListService = require('./services/caseListService');
const createPdfService = require('./services/pdfService');

const signInService = createSignInService();
const licenceService = createLicenceService(licenceClient);
const conditionsService = createConditionsService(licenceClient);
const prisonerService = createPrisonerService(nomisClientBuilder);
const caseListService = createCaseListService(nomisClientBuilder, licenceClient);
const pdfService = createPdfService(licenceService, conditionsService, prisonerService);

const app = createApp({
    logger,
    signInService,
    licenceService,
    prisonerService,
    conditionsService,
    caseListService,
    pdfService
});

module.exports = app;
