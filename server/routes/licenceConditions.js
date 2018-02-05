const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/licenceConditions');
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
        logger.debug(`GET licenceConditions/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const {licenceSection, nextPath} = formConfig[formName];
        const data = getIn(rawLicence, ['licence', 'licenceConditions', licenceSection]) || {};

        res.render(`licenceConditions/${formName}Form`, {nomisId, data, nextPath});
    }));

    router.post('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;

        logger.debug(`POST licenceConditions/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor({formName, data: req.body, formConfig});

        if (formConfig[formName].fields) {
            await licenceService.update({
                licence: rawLicence.licence,
                nomisId: nomisId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                licenceSection: 'licenceConditions',
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
