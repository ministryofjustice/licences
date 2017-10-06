const createApp = require('./app');
const licencesApi = require('../server/data/api');
const logger = require('../log');

const createReportService = require('./services/reportingInstructionsService');
const createLicenceDetailsService = require('./services/licenceDetailsService');
const createDischargeAddressService = require('./services/dischargeAddressService');
const createPrisonerDetailsService = require('./services/prisonerDetailsService');

// TODO inject API/DB dependencies into services
const reportingInstructionService = createReportService();
const licenceDetailsService = createLicenceDetailsService();
const dischargeAddressService = createDischargeAddressService();
const prisonerDetailsService = createPrisonerDetailsService(licencesApi);

const app = createApp({
    logger,
    reportingInstructionService,
    licenceDetailsService,
    dischargeAddressService,
    prisonerDetailsService
});

module.exports = app;
