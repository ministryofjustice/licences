const createApp = require('./app');

const logger = require('../log');

const createReportService = require('./services/reportingInstructionsService');
const createLicenceDetailsService = require('./services/licenceDetailsService');

// TODO inject API/DB dependencies into services
const reportingInstructionService = createReportService();
const licenceDetailsService = createLicenceDetailsService();

const app = createApp({
    logger,
    reportingInstructionService,
    licenceDetailsService
});

module.exports = app;
