const express = require('express');

module.exports = function({reportingService}) {
    const router = express.Router();

    const getMethods = {
        addressSubmission: reportingService.getAddressSubmission,
        assessmentComplete: reportingService.getAssessmentComplete
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

