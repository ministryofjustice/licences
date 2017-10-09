const createApp = require('./app');
const licencesApi = require('../server/data/api');
const database = require('../server/data/licences');
const logger = require('../log');
const audit = require('../server/data/audit');
const userManager = {getUser: () => 1};

const createReportService = require('./services/reportingInstructionsService');
const createLicenceDetailsService = require('./services/licenceDetailsService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');
const createTasklistService = require('./services/tasklistService');

// TODO inject API/DB dependencies into services
const reportingInstructionService = createReportService();
const licenceDetailsService = createLicenceDetailsService();
const dischargeAddressService = createDischargeAddressService();
const prisonerDetailsService = createPrisonerDetailsService(licencesApi);
const tasklistService = createTasklistService(licencesApi, database);

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
