const {asyncMiddleware} = require('../utils/middleware');
const createStandardRoutes = require('./routeWorkers/standard');
const {getIn, lastIndex, lastItem, isEmpty} = require('../utils/functionalHelpers');
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


