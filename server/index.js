const createApp = require('./app');

const createReportService = require('./services/reportingInstructionsService');

// TODO inject API/DB dependencies into services
const reportingInstructionService = createReportService();

const app = createApp({reportingInstructionService});

module.exports = app;
