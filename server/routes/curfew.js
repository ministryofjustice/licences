const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getPathFor} = require('../utils/routes');
const {getIn} = require('../utils/functionalHelpers');
const formConfig = require('./config/curfew');

module.exports = ({licenceService}) => (router, audited) => {

    const standard = createStandardRoutes({formConfig, licenceService, sectionName: 'curfew'});

    router.get('/curfew/curfewAddressReview/:bookingId', addressReviewGets('curfewAddressReview'));
    router.get('/curfew/curfewAddressReview/:action/:bookingId', addressReviewGets('curfewAddressReview'));

    function addressReviewGets(formName) {
        return (req, res) => {
            const {action, bookingId} = req.params;

            const proposedAddress = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress']);
            const data = getIn(res.locals.licence, ['licence', 'curfew', formName]) || {};
            const nextPath = formConfig[formName].nextPath;

            res.render(`curfew/${formName}`, {bookingId, data, proposedAddress, nextPath, action});
        };
    }

    router.post('/curfew/curfewAddressReview/:bookingId', audited,
        asyncMiddleware(addressReviewPosts('curfewAddressReview')));
    router.post('/curfew/curfewAddressReview/:action/:bookingId', audited,
        asyncMiddleware(addressReviewPosts('curfewAddressReview')));

    function addressReviewPosts(formName) {
        return (req, res) => {
            const {action, bookingId} = req.params;
            const {licence} = res.locals;

            const modify = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(licence.stage);
            const modifyAction = (!action && modify) ? 'modify' : action;

            standard.formPost(req, res, 'curfew', formName, bookingId, modifyAction);
        };
    }

    router.post('/curfew/withdrawAddress/:bookingId', audited, asyncMiddleware(addressWithdrawalPosts('withdrawAddress')));
    router.post('/curfew/withdrawConsent/:bookingId', audited, asyncMiddleware(addressWithdrawalPosts('withdrawConsent')));

    function addressWithdrawalPosts(formName) {
        return async (req, res) => {
            const {action, bookingId} = req.params;
            const {licence, stage} = res.locals.licence;

            await licenceService.rejectProposedAddress(licence, bookingId, formName);

            const modify = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage);
            const modifyAction = (!action && modify) ? 'modify' : action;

            const nextPath = getPathFor({
                data: req.body,
                config: formConfig[formName],
                action: modifyAction
            });

            res.redirect(`${nextPath}${bookingId}`);
        };
    }

    router.post('/curfew/reinstateAddress/:bookingId', audited, asyncMiddleware(async (req, res) => {
        const {action, bookingId} = req.params;
        const {licence, stage} = res.locals.licence;

        await licenceService.reinstateProposedAddress(licence, bookingId);

        const modify = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage);
        const modifyAction = (!action && modify) ? 'modify' : action;

        const nextPath = getPathFor({
            data: req.body,
            config: formConfig.reinstateAddress,
            action: modifyAction
        });

        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.post('/curfew/curfewHours/:bookingId', audited, asyncMiddleware(async (req, res) => {
        const {bookingId} = req.params;
        const nextPath = getPathFor({data: req.body, config: formConfig.curfewHours});

        const input = licenceService.addCurfewHoursInput(req.body);
        await licenceService.update({
            bookingId,
            originalLicence: res.locals.licence,
            config: formConfig.curfewHours,
            userInput: input,
            licenceSection: 'curfew',
            formName: 'curfewHours'
        });

        res.redirect(`${nextPath}${bookingId}`);
    }));

    router.get('/curfew/:formName/:bookingId', asyncMiddleware(standard.get));
    router.post('/curfew/:formName/:bookingId', audited, asyncMiddleware(standard.post));

    router.get('/curfew/:formName/:action/:bookingId', asyncMiddleware(standard.get));
    router.post('/curfew/:formName/:action/:bookingId', audited, asyncMiddleware(standard.post));

    return router;
};


