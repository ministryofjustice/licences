const express = require('express');
const asyncMiddleware = require('../utils/asyncMiddleware');
const {getIn} = require('../utils/functionalHelpers');

const nextPaths = {
    optOut: {
        decision: {
            field: 'decision',
            Yes: '/hdc/taskList/',
            No: '/hdc/proposedAddress/bassReferral/'
        }
    },
    bassReferral: {
        constant: '/hdc/taskList/'
    }
};

const decidePath = (decisionInfo, data) => {
    const decidingValue = data[decisionInfo.field];
    return decisionInfo[decidingValue];
};

const pathFor = (path, body) => {
    if (nextPaths[path].constant) {
        return nextPaths[path].constant;
    }
    if (nextPaths[path].decision) {
        return decidePath(nextPaths[path].decision, body);
    }
    return path(body);
};


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
        const data = getIn(rawLicence, ['licence', formName]);

        res.render(`proposedAddress/${formName}Form`, {nomisId, data});
    }));

    router.post('/:formName/:nomisId', asyncMiddleware(async (req, res) => {
        const {nomisId, formName} = req.params;
        logger.debug(`POST proposedAddress/${formName}/${nomisId}`);

        await update(licenceService, formName, req.body);

        res.redirect(pathFor(formName, req.body) + nomisId);
    }));

    return router;
};

function update(licenceService, formName, body) {
    const updateFunction = {
        optOut: licenceService.updateOptOut,
        bassReferral: licenceService.updateBassReferral
    };

    return updateFunction[formName](body);
}
