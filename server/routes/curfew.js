const express = require('express');
const {async, checkLicenceMiddleWare, authorisationMiddleware, auditMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getPathFor} = require('../utils/routes');
const {getIn, lastItem, lastIndex} = require('../utils/functionalHelpers');
const formConfig = require('./config/curfew');

module.exports = function({licenceService, prisonerService, authenticationMiddleware, audit}) {

    const router = express.Router();
    router.use(authenticationMiddleware());
    router.param('bookingId', checkLicenceMiddleWare(licenceService, prisonerService));
    router.param('bookingId', authorisationMiddleware);

    const audited = auditMiddleware(audit, 'UPDATE_SECTION');

    router.use(function(req, res, next) {
        if (typeof req.csrfToken === 'function') {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    });

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'curfew'});

    router.get('/curfew/curfewAddressReview/:bookingId', addressReviewGets('curfewAddressReview'));
    router.post('/curfew/curfewAddressReview/:bookingId', audited, async(addressReviewPosts('curfewAddressReview')));

    router.get('/curfew/curfewAddressReview/:action/:bookingId', addressReviewGets('curfewAddressReview'));
    router.post('/curfew/curfewAddressReview/:action/:bookingId', audited,
        async(addressReviewPosts('curfewAddressReview')));


    router.get('/curfew/addressSafety/:bookingId', addressReviewGets('addressSafety'));
    router.post('/curfew/addressSafety/:bookingId', audited, async(addressReviewPosts('addressSafety')));

    router.get('/curfew/addressSafety/:action/:bookingId', addressReviewGets('addressSafety'));
    router.post('/curfew/addressSafety/:action/:bookingId', audited, async(addressReviewPosts('addressSafety')));


    router.post('/curfew/withdrawAddress/:bookingId', audited, async(addressReviewPosts('withdrawAddress')));
    router.post('/curfew/withdrawConsent/:bookingId', audited, async(addressReviewPosts('withdrawConsent')));
    router.post('/curfew/reinstateAddress/:bookingId', audited, async(addressReviewPosts('reinstateAddress')));

    router.post('/curfew/curfewHours/:bookingId', audited, async(async (req, res) => {
        const {bookingId} = req.params;
        const nextPath = getPathFor({data: req.body, config: formConfig.curfewHours});

        const input = getCurfewHoursInput(req.body);

        await licenceService.update({
            bookingId: bookingId,
            config: formConfig.curfewHours,
            userInput: input,
            licenceSection: 'curfew',
            formName: 'curfewHours'
        });

        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/curfew/:formName/:bookingId', async(standard.get));
    router.post('/curfew/:formName/:bookingId', audited, async(standard.post));

    router.get('/curfew/:formName/:action/:bookingId', async(standard.get));
    router.post('/curfew/:formName/:action/:bookingId', audited, async(standard.post));

    function addressReviewGets(formName) {
        return (req, res) => {
            const {action, bookingId} = req.params;

            const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const data = lastItem(addresses);
            const nextPath = formConfig[formName].nextPath;

            res.render(`curfew/${formName}`, {bookingId, data, nextPath, action});
        };
    }

    function addressReviewPosts(formName) {
        return async (req, res) => {
            const {action, bookingId} = req.params;

            const rawLicence = res.locals.licence;
            const addresses = getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const addressIndex = lastIndex(addresses);

            await licenceService.updateAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                index: addressIndex
            });

            const modify = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(rawLicence.stage);
            const modifyAction = (!action && modify) ? 'modify' : action;

            const nextPath = getPathFor({
                data: req.body,
                config: formConfig[formName],
                action: modifyAction
            });

            res.redirect(`${nextPath}${bookingId}`);
        };
    }

    function getCurfewHoursInput(formBody) {
        if (formBody.daySpecificInputs === 'Yes') {
            return formBody;
        }

        return copyAllInputsToDays(formBody);
    }

    function copyAllInputsToDays(formBody) {
        return Object.keys(formBody).reduce((input, fieldItem) => {
            if (fieldItem.includes('From')) {
                return {...input, [fieldItem]: formBody.allFrom};
            }

            if (fieldItem.includes('Until')) {
                return {...input, [fieldItem]: formBody.allUntil};
            }

            return input;
        }, formBody);
    }

    return router;
};


