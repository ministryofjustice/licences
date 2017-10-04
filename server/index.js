const createApp = require('./app');

const logger = require('../log');

const createReportService = require('./services/reportingInstructionsService');
const createLicenceDetailsService = require('./services/licenceDetailsService');
const createDischargeAddressService = require('./services/dischargeAddressService');

// TODO inject API/DB dependencies into services
const reportingInstructionService = createReportService();
const licenceDetailsService = createLicenceDetailsService();
const dischargeAddressService = createDischargeAddressService();

const app = createApp({
    logger,
    reportingInstructionService,
    licenceDetailsService,
    dischargeAddressService
});

module.exports = app;
