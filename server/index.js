const createApp = require('./app');
const licencesApi = require('../server/data/api');
const logger = require('../log');
const audit = require('../server/data/audit');
const userManager = {getUser: () => 1};
const dbClient = require('./data/dbClient');
const deliusClient = require('./data/deliusClient');
const nomisClient = require('./data/nomisClient');

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
const prisonerDetailsService = createPrisonerDetailsService(licencesApi);
const tasklistService = createTasklistService(deliusClient, nomisClient, dbClient);

const app = createApp({
    logger,
    signInService,
    reportingInstructionService,
    licenceDetailsService,
    dischargeAddressService,
    prisonerDetailsService,
    tasklistService,
    audit,
    userManager
});

module.exports = app;
