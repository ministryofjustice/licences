const createApp = require('./app');
const logger = require('../log');
const licenceClient = require('./data/licenceClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');

const createSignInService = require('./authentication/signIn');
const createLicenceService = require('./services/licenceService');
const createPrisonerDetailsService = require('./services/prisonerService');
const createConditionsService = require('./services/conditionsService');
const createCaseListService = require('./services/caseListService');

const signInService = createSignInService();
const licenceService = createLicenceService(licenceClient);
const conditionsService = createConditionsService(licenceClient);
const prisonerService = createPrisonerDetailsService(nomisClientBuilder);
const caseListService = createCaseListService(nomisClientBuilder);

const app = createApp({
    logger,
    signInService,
    licenceService,
    prisonerService,
    conditionsService,
    caseListService
});

module.exports = app;
