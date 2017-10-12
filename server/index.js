const createApp = require('./app');
const logger = require('../log');
const audit = require('../server/data/audit');
const userManager = {getUser: () => 1};
const dbClient = require('./data/dbClient');
const deliusClient = require('./data/deliusClient');
const nomisClient = require('./data/nomisClient');


const createReportService = require('./services/reportingInstructionsService');
const createLicenceDetailsService = require('./services/licenceDetailsService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');
const createTasklistService = require('./services/tasklistService');

// TODO inject API/DB dependencies into services
const reportingInstructionService = createReportService();
const licenceDetailsService = createLicenceDetailsService();
const dischargeAddressService = createDischargeAddressService();
const prisonerDetailsService = createPrisonerDetailsService(nomisClient);
const tasklistService = createTasklistService(deliusClient, nomisClient, dbClient);

const app = createApp({
    logger,
    reportingInstructionService,
    licenceDetailsService,
    dischargeAddressService,
    prisonerDetailsService,
    tasklistService,
    audit,
    userManager
});

module.exports = app;
