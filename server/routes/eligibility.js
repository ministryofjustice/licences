const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/eligibility');
const {getPathFor} = require('../utils/routes');

module.exports = function({logger, licenceService, authenticationMiddleware}) {
    const router = express.Router();
    router.use(authenticationMiddleware());

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    router.get('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;

        logger.debug(`GET eligibility/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const {licenceSection} = formConfig[formName];
        const data = getIn(rawLicence, ['licence', 'eligibility', licenceSection]) || {};

        res.render(`eligibility/${licenceSection}Form`, {nomisId, data});
    }));

    router.post('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;

        logger.debug(`POST eligibility/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor({formName, data: req.body, formConfig});

        await licenceService.update({
            licence: rawLicence.licence,
            nomisId: nomisId,
            fieldMap: formConfig[formName].fields,
            userInput: req.body,
            licenceSection: 'eligibility',
            formName: formName
        });

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};
