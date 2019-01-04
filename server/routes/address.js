const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getIn, mergeWithRight} = require('../utils/functionalHelpers');
const formConfig = require('./config/proposedAddress');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'proposedAddress'});

    router.get('/proposedAddress/curfewAddressChoice/:action/:bookingId', asyncMiddleware(getChoice));
    router.get('/proposedAddress/curfewAddressChoice/:bookingId', asyncMiddleware(getChoice));

    function getChoice(req, res) {

        const {bookingId} = req.params;
        const licence = res.locals.licence;
        const data = {decision: getCurfewAddressChoice(getIn(licence, ['licence']))};
        const viewData = {data, errorObject: {}, bookingId};

        return res.render('proposedAddress/curfewAddressChoice', viewData);
    }

    router.post('/proposedAddress/curfewAddressChoice/:bookingId', audited, asyncMiddleware(async (req, res) => {
        const {bookingId} = req.params;
        const {decision} = req.body;
        const {licence} = res.locals;

        const bassReferral = getBassReferralContent(decision, licence);

        const proposedAddress = getIn(licence, ['licence', 'proposedAddress']);
        const newProposedAddress = mergeWithRight(proposedAddress, proposedAddressContents[decision]);

        await Promise.all([
            licenceService.updateSection('proposedAddress', bookingId, newProposedAddress),
            licenceService.updateSection('bassReferral', bookingId, bassReferral)
        ]);

        const nextPath = formConfig.curfewAddressChoice.nextPath[decision] || `/hdc/taskList/`;

        return res.redirect(`${nextPath}${bookingId}`);
    }));

    router.post('/proposedAddress/rejected/:bookingId', audited, asyncMiddleware(async (req, res) => {
        const {enterAlternative, bookingId} = req.body;
        const {licence} = res.locals.licence;

        if (enterAlternative === 'Yes') {
            await licenceService.rejectProposedAddress(licence, bookingId);
        }

        const nextPath = formConfig.rejected.nextPath.decisions[enterAlternative];
        return res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/proposedAddress/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.get('/proposedAddress/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/proposedAddress/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));
    router.post('/proposedAddress/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};

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

