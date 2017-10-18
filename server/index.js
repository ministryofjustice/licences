const createApp = require('./app');
const logger = require('../log');
const audit = require('../server/data/audit');
const userManager = {getUser: () => 1};
const licenceClient = require('./data/licenceClient');
const deliusClient = require('./data/deliusClient');
const nomisClient = require('./data/nomisClient');

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
const tasklistService = createTasklistService(deliusClient, nomisClient, licenceClient);

const app = createApp({
    logger,
    signInService,
    reportingInstructionService,
    licenceService,
    dischargeAddressService,
    prisonerDetailsService,
    tasklistService,
    audit,
    userManager
});

module.exports = app;
