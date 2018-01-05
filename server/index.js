const createApp = require('./app');
const logger = require('../log');
const licenceClient = require('./data/licenceClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');
const establishmentsClient = require('./data/establishmentsClient');

const createSignInService = require('./authentication/signIn');
const createLicenceService = require('./services/licenceService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');
const createConditionsService = require('./services/conditionsService');
const createCaseListService = require('./services/caseListService');

const signInService = createSignInService();
const licenceService = createLicenceService(licenceClient, establishmentsClient);
const conditionsService = createConditionsService(licenceClient);
const dischargeAddressService = createDischargeAddressService(nomisClientBuilder, licenceClient);
const prisonerDetailsService = createPrisonerDetailsService(nomisClientBuilder);
const caseListService = createCaseListService(nomisClientBuilder);

const app = createApp({
    logger,
    signInService,
    licenceService,
    dischargeAddressService,
    prisonerDetailsService,
    conditionsService,
    caseListService
});

module.exports = app;
