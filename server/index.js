const createApp = require('./app');
const logger = require('../log');
const licenceClient = require('./data/licenceClient');
const deliusClient = require('./data/deliusClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');

const createSignInService = require('./authentication/signIn');
const createReportService = require('./services/reportingInstructionsService');
const createLicenceService = require('./services/licenceService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');
const createTasklistService = require('./services/tasklistService');

const signInService = createSignInService();
const reportingInstructionService = createReportService();
const licenceService = createLicenceService(licenceClient);
const dischargeAddressService = createDischargeAddressService();
const prisonerDetailsService = createPrisonerDetailsService(nomisClient);
const tasklistService = createTasklistService(deliusClient, nomisClientBuilder, licenceClient);

const app = createApp({
    logger,
    signInService,
    reportingInstructionService,
    licenceService,
    dischargeAddressService,
    prisonerDetailsService,
    tasklistService
});

module.exports = app;
