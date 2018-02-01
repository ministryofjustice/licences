const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/proposedAddress');
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
        logger.debug(`GET proposedAddress/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const {licenceSection, nextPath} = formConfig[formName];
        const data = getIn(rawLicence, ['licence', 'proposedAddress', licenceSection]) || {};

        res.render(`proposedAddress/${formName}Form`, {nomisId, data, nextPath});
    }));

    router.post('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;

        logger.debug(`POST proposedAddress/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor({formName, data: req.body, formConfig});

        if (formConfig[formName].fields) {
            await licenceService.update({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                licenceSection: 'proposedAddress',
                formName: formName
            });
        }

        if (formConfig[formName].statusChange) {
            const status = req.body[formConfig[formName].statusChange.field];
            await licenceService.updateStatus(nomisId, status);
        }

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};
