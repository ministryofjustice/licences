const express = require('express');

module.exports = function({reportingService}) {
    const router = express.Router();

    router.get('/addressSubmission/', async (req, res) => {

        try {
            const response = await reportingService.getAddressSubmission();
            return res.send(response);

        } catch (err) {
            return res.status(500).json(err);
        }

    });

    router.get('/addressSubmission/:bookingId', async (req, res) => {
        const {bookingId} = req.params;

        try {
            const response = await reportingService.getAddressSubmission(bookingId);
            return res.send(response);

        } catch (err) {
            return res.status(500).json(err);
        }

    });

    return router;
};

