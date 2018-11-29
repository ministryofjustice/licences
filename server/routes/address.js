const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getIn, lastIndex, lastItem, isEmpty, mergeWithRight} = require('../utils/functionalHelpers');
const formConfig = require('./config/proposedAddress');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'proposedAddress'});

    router.get('/proposedAddress/curfewAddress/:bookingId', getAddress);
    router.get('/proposedAddress/curfewAddress/:action/:bookingId', getAddress);

    function getAddress(req, res) {

        const {bookingId, action} = req.params;
        const addresses = getAddresses(res.locals.licence);

        if (!addresses) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: []});
        }

        if (isAddingAddress(addresses, action)) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: {}});
        }

        return res.render('proposedAddress/curfewAddress', {bookingId, data: lastItem(addresses)});
    }

    router.get('/proposedAddress/curfewAddressChoice/:action/:bookingId', asyncMiddleware(getChoice));
    router.get('/proposedAddress/curfewAddressChoice/:bookingId', asyncMiddleware(getChoice));

    function getChoice(req, res) {

        const {bookingId} = req.params;
        const licence = res.locals.licence;
        const data = {decision: getCurfewAddressChoice(getIn(licence, ['licence']))};
        const viewData = {data, errorObject: {}, bookingId};

        return res.render('proposedAddress/curfewAddressChoice', viewData);
    }

    router.post('/proposedAddress/curfewAddressChoice/:action/:bookingId', audited, asyncMiddleware(postCurfewAddressChoice));
    router.post('/proposedAddress/curfewAddressChoice/:bookingId', audited, asyncMiddleware(postCurfewAddressChoice));

    async function postCurfewAddressChoice(req, res) {

        const {bookingId, action} = req.params;
        const {decision} = req.body;
        const licence = res.locals.licence;

        const proposedAddress = getIn(licence, ['licence', 'proposedAddress']);
        const newProposedAddress = mergeWithRight(proposedAddress, proposedAddressContents[decision]);

        const bassReferral = getBassReferralContent(decision, licence);

        await Promise.all([
            licenceService.updateSection('proposedAddress', bookingId, newProposedAddress),
            licenceService.updateSection('bassReferral', bookingId, bassReferral)
        ]);

        const nextPath = formConfig.curfewAddressChoice.nextPath[decision] || `/hdc/taskList/${bookingId}`;

        if (action) {
            return res.redirect(`${nextPath}${action}/${bookingId}`);
        }
        return res.redirect(`${nextPath}${bookingId}`);
    }

    router.post('/proposedAddress/curfewAddress/:action/:bookingId', audited, asyncMiddleware(async (req, res) => {
        const {bookingId, action} = req.params;
        const addresses = getAddresses(res.locals.licence);

        const rawLicence = res.locals.licence;
        const userInput = req.body;

        if (isAddingAddress(addresses, action)) {

            if (isEmptySubmission(userInput)) {
                return res.redirect(`/hdc/proposedAddress/curfewAddress/${action}/${bookingId}`);
            }

            await licenceService.addAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput
            });

        } else {
            await licenceService.updateAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput,
                index: lastIndex(addresses)
            });
        }

        const nextPath = formConfig.curfewAddress.nextPath[action] || formConfig.curfewAddress.nextPath['path'];
        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/proposedAddress/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/proposedAddress/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};

function getAddresses(licence) {
    return getIn(licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
}

function isAddingAddress(addresses, action) {
    return isEmpty(addresses) || ['rejected', 'add'].includes(action);
}

function isEmptySubmission(userInput) {
    const {addressLine1, addressTown, postCode} = userInput.addresses[0];
    return !addressLine1 && !addressTown && !postCode;
}

function getCurfewAddressChoice(licence) {
    if (isYes(licence, ['proposedAddress', 'optOut', 'decision'])) {
        return 'OptOut';
    }

    if (isYes(licence, ['proposedAddress', 'addressProposed', 'decision'])) {
        return 'Address';
    }

    if (isYes(licence, ['bassReferral', 'bassRequest', 'bassRequested'])) {
        return 'Bass';
    }

    return null;
}

function isYes(licence, pathSegments) {
    const answer = getIn(licence, pathSegments);
    return answer && answer === 'Yes';
}

function getBassReferralContent(decision, licence) {
    const bassReferral = getIn(licence, ['licence', 'bassReferral']);
    const bassRequest = getIn(bassReferral, ['bassRequest']);
    const bassAnswer = decision === 'Bass' ? 'Yes' : 'No';

    return {...bassReferral, bassRequest: {...bassRequest, bassRequested: bassAnswer}};
}

const proposedAddressContents = {
    OptOut: {optOut: {decision: 'Yes'}, addressProposed: {decision: 'No'}},
    Address: {optOut: {decision: 'No'}, addressProposed: {decision: 'Yes'}},
    Bass: {optOut: {decision: 'No'}, addressProposed: {decision: 'No'}}
};

