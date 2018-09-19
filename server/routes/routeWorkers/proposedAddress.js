const {getIn, lastIndex, lastItem, isEmpty} = require('../../utils/functionalHelpers');

module.exports = ({formConfig, licenceService}) => {

    function getAddress(req, res) {

        const {bookingId, action} = req.params;

        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);

        if (!addresses) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: []});
        }

        if (action === 'add' || isEmpty(addresses)) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: {}, action: 'add'});
        }

        return res.render('proposedAddress/curfewAddress', {bookingId, data: lastItem(addresses), action: action || 'update'});
    }

    async function postAddress(req, res) {
        const {bookingId} = req.body;
        const {action} = req.params;

        const rawLicence = res.locals.licence;
        const userInput = req.body;

        if (action === 'add') {

            const {addressLine1, addressTown, postCode} = userInput.addresses[0];

            if (!addressLine1 && !addressTown && !postCode) {
                return res.redirect(`/hdc/proposedAddress/curfewAddress/${action}/${bookingId}`);
            }

            await addressAdd(bookingId, rawLicence, userInput);

        } else {
            await addressUpdate(bookingId, rawLicence, userInput);
        }

        const nextPath = formConfig.curfewAddress.nextPath[action] || formConfig.curfewAddress.nextPath['path'];
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
