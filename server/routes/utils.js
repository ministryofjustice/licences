const logger = require('../../log');
const express = require('express');

const {async} = require('../utils/middleware');
const licenceClient = require('../data/licenceClient');

module.exports = function() {
    const router = express.Router();

    router.get('/reset', async(async (req, res, next) => {
        logger.info('Deleting licence records');
        await licenceClient.deleteAll();
        return res.redirect('/');
    }));

    router.get('/reset-test', async(async (req, res, next) => {
        logger.info('Deleting test licence records');

        try {
            await licenceClient.deleteAllTest();
            return res.status(200).send({});
        } catch (error) {
            logger.error('Error during delete test licences', error.stack);
            return res.status(500).send({});
        }

    }));

    router.post('/create/:bookingId', async(async (req, res, next) => {
        logger.info('Creating test licence record');

        const {bookingId} = req.params;
        const {licence, stage} = req.body;

        if (!bookingId || !licence || !stage) {
            logger.warn('Missing input for create test licence');
            return res.status(404).send({});
        }

        try {
            await licenceClient.createLicence(bookingId, licence, stage);
            logger.info('Created licence');
            return res.status(201).send({});
        } catch (error) {
            logger.error('Error during create licence', error.stack);
            return res.status(500).send({});
        }
    }));

    return router;
};
