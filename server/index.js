const createApp = require('./app');
const logger = require('../log');
const licenceClient = require('./data/licenceClient');
const deliusClient = require('./data/deliusClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');
const establishmentsClient = require('./data/establishmentsClient');

const createSignInService = require('./authentication/signIn');
const createLicenceService = require('./services/licenceService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');
const createTasklistService = require('./services/tasklistService');
const createConditionsService = require('./services/conditionsService');

const signInService = createSignInService();
const licenceService = createLicenceService(licenceClient, establishmentsClient);
const conditionsService = createConditionsService(licenceClient);
const dischargeAddressService = createDischargeAddressService(nomisClientBuilder, licenceClient);
const prisonerDetailsService = createPrisonerDetailsService(nomisClientBuilder);
const tasklistService = createTasklistService(deliusClient, nomisClientBuilder, licenceClient);

const app = createApp({
    logger,
    signInService,
    licenceService,
    dischargeAddressService,
    prisonerDetailsService,
    tasklistService,
    conditionsService
});

module.exports = app;
