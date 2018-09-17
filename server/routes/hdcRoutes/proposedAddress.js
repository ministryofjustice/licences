const {getIn, lastIndex, lastItem} = require('../../utils/functionalHelpers');
const formConfig = require('../config/proposedAddress');

module.exports = ({licenceService}) => {

    function getAddress(req, res) {
        const {action, bookingId} = req.params;
        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);

        if (!addresses) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: [], submitAction: action});
        }

        if (action === 'add') {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: {}, submitAction: action});
        }

        // change, update
        return res.render('proposedAddress/curfewAddress', {
            bookingId,
            data: lastItem(addresses),
            submitAction: action
        });
    }

    async function postAddress(req, res) {
        const {action, bookingId} = req.body;

        const rawLicence = res.locals.licence;
        const userInput = req.body;

        if (action === 'do' || action === 'add') {

            const {addressLine1, addressTown, postCode} = userInput.addresses[0];

            if (!addressLine1 && !addressTown && !postCode) {
                return res.redirect(`/hdc/proposedAddress/curfewAddress/${action}/${bookingId}`);
            }

            await addressAdd(bookingId, rawLicence, userInput);

        } else { // change, update
            await addressUpdate(bookingId, rawLicence, userInput);
        }

        const nextPath = formConfig.curfewAddress.nextPath[action];
        res.redirect(`${nextPath}${bookingId}`);
    }

    async function addressAdd(bookingId, rawLicence, userInput) {

        await licenceService.addAddress({
            rawLicence,
            bookingId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput
        });
    }

    async function addressUpdate(bookingId, rawLicence, userInput) {

        const addressIndex = lastIndex(getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']));

        await licenceService.updateAddress({
            rawLicence,
            bookingId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput,
            index: addressIndex
        });
    }

    return {
        getAddress,
        postAddress
    };
};
