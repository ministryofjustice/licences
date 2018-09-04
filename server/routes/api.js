const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');

module.exports = function({reportingService}) {
    const router = express.Router();

    router.use('/docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    const getMethods = {
        addressSubmission: reportingService.getAddressSubmission,
        assessmentComplete: reportingService.getAssessmentComplete,
        finalChecksComplete: reportingService.getFinalChecksComplete,
        decisionMade: reportingService.getApprovalComplete
    };

    router.get('/:report/', async (req, res) => {
        const {report} = req.params;
        if (!getMethods[report]) {
            return res.status(404).json({message: 'Not found'});
        }

        try {
            const response = await getMethods[report]();
            return res.send(response);

        } catch (err) {
            return res.status(500).json({message: 'Error accessing data'});
        }
    });

    router.get('/:report/:bookingId', async (req, res) => {
        const {report, bookingId} = req.params;

        if (!getMethods[report]) {
            return res.status(404).json({message: 'Not found'});
        }

        try {
            const response = await getMethods[report](bookingId);
            return res.send(response);

        } catch (err) {
            return res.status(500).json({message: 'Error accessing data'});
        }
    });

    return router;
};

