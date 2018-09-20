const {getIn, lastIndex, lastItem, isEmpty} = require('../../utils/functionalHelpers');

module.exports = ({formConfig, licenceService}) => {

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

    async function postAddress(req, res) {

        const {bookingId, action} = req.params;
        const addresses = getAddresses(res.locals.licence);

        const rawLicence = res.locals.licence;
        const userInput = req.body;

        if (isAddingAddress(addresses, action)) {

            if (isEmptySubmission(userInput)) {
                return res.redirect(`/hdc/proposedAddress/curfewAddress/${action}/${bookingId}`);
            }

            await addressAdd(bookingId, rawLicence, userInput);

        } else {
            await addressUpdate(bookingId, rawLicence, userInput, lastIndex(addresses));
        }

        const nextPath = formConfig.curfewAddress.nextPath[action] || formConfig.curfewAddress.nextPath['path'];
        res.redirect(`${nextPath}${bookingId}`);
    }

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

    async function addressAdd(bookingId, rawLicence, userInput) {
        await licenceService.addAddress({
            rawLicence,
            bookingId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput
        });
    }

    async function addressUpdate(bookingId, rawLicence, userInput, addressIndex) {
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
