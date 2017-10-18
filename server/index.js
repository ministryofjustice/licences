const createApp = require('./app');
const logger = require('../log');
// const audit = require('../server/data/audit');
const dbClient = require('./data/dbClient');
const deliusClient = require('./data/deliusClient');
const nomisClientBuilder = require('./data/nomisClientBuilder');

const createSignInService = require('./authentication/signIn');
const createReportService = require('./services/reportingInstructionsService');
const createLicenceDetailsService = require('./services/licenceDetailsService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');
const createTasklistService = require('./services/tasklistService');

const signInService = createSignInService();
const reportingInstructionService = createReportService();
const licenceDetailsService = createLicenceDetailsService();
const dischargeAddressService = createDischargeAddressService();
const prisonerDetailsService = createPrisonerDetailsService(nomisClientBuilder);
const tasklistService = createTasklistService(deliusClient, nomisClientBuilder, dbClient);

const app = createApp({
    logger,
    signInService,
    reportingInstructionService,
    licenceDetailsService,
    dischargeAddressService,
    prisonerDetailsService,
    tasklistService
});

module.exports = app;
