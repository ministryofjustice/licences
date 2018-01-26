const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/proposedAddress');

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
        const data = getIn(rawLicence, ['licence', 'proposedAddress', formName]);

        res.render(`proposedAddress/${formName}Form`, {nomisId, data});
    }));

    router.post('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;
        logger.debug(`POST proposedAddress/${formName}/${nomisId}`);

        const rawLicence = await licenceService.getLicence(nomisId);
        const nextPath = getPathFor(formName, req.body);

        await licenceService.update({
            licence: rawLicence.licence,
            nomisId: nomisId,
            fieldMap: formConfig[formName].fields,
            userInput: req.body,
            licenceSection: 'proposedAddress',
            formName: formName
        });

        res.redirect(`${nextPath}${nomisId}`);
    }));

    return router;
};

function decidePath(decisionInfo, data) {
    const decidingValue = data[decisionInfo.fieldToDecideOn];
    return decisionInfo[decidingValue];
}

function getPathFor(formName, body) {
    if (formConfig[formName].nextPath) {
        return formConfig[formName].nextPath;
    }
    if (formConfig[formName].nextPathDecision) {
        return decidePath(formConfig[formName].nextPathDecision, body);
    }
    return formName(body);
}
