const express = require('express');
const {asyncMiddleware} = require('../utils/middleware');
const licenceClient = require('../data/licenceClient');

module.exports = function({logger, licenceService}) {
    const router = express.Router();

    router.get('/reset', asyncMiddleware(async (req, res, next) => {
        logger.info('Deleting licence records');

        await licenceClient.deleteAll();

        return res.redirect('/');
    }));

    router.get('/reset-test', asyncMiddleware(async (req, res, next) => {
        logger.info('Deleting test licence records');

        try {
            await licenceClient.deleteAllTest();
            return res.status(200).send({});
        } catch (error) {
            logger.error('Error during delete test licences', error.stack);
            return res.status(500).send({});
        }

    }));

    router.post('/create/:nomisId', asyncMiddleware(async (req, res, next) => {
        logger.info('Creating test licence record');

        const {nomisId} = req.params;
        const {licence, stage} = req.body;

        logger.info('nomisId: ', nomisId);
        logger.info('stage: ', stage);
        logger.info('licence: ', licence);

        if (!nomisId || !licence || !stage) {
            logger.warn('Missing input for create test licence');
            return res.status(404).send({});
        }

        if (!nomisId.endsWith('XX')) {
            logger.warn('Test licences must have nomis ID ending XX');
            return res.status(404).send({});
        }

        try {
            await licenceClient.createLicence(nomisId, licence, stage);
            logger.info('Created licence');
            return res.status(201).send({});
        } catch (error) {
            logger.error('Error during create licence', error.stack);
            return res.status(500).send({});
        }
    }));

    return router;
};
