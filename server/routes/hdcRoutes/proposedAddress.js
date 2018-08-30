const {getCurfewAddressFormData} = require('../../utils/addressHelpers');
const {getIn, lastIndex} = require('../../utils/functionalHelpers');
const formConfig = require('../config/proposedAddress');

module.exports = ({licenceService}) => {

    function getAddress(req, res) {
        const {bookingId} = req.params;
        const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);

        if (!addresses) {
            return res.render('proposedAddress/curfewAddress', {bookingId, data: []});
        }

        const {submitPath, addressToShow} = getCurfewAddressFormData(addresses);

        res.render('proposedAddress/curfewAddress', {bookingId, data: addressToShow, submitPath});
    }

    async function postAddAddress(req, res) {
        const {bookingId} = req.body;
        const {addressLine1, addressTown, postCode} = req.body.addresses[0];

        if (!addressLine1 && !addressTown && !postCode) {
            return res.redirect(`/hdc/proposedAddress/curfewAddress/${bookingId}`);
        }

        const rawLicence = res.locals.licence;
        const nextPath = '/hdc/taskList/';

        if (formConfig.curfewAddress.fields) {
            await licenceService.addAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig.curfewAddress.fields,
                userInput: req.body
            });
        }

        res.redirect(`${nextPath}${bookingId}`);
    }

    async function postUpdateAddress(req, res) {
        const {bookingId} = req.body;
        const rawLicence = await res.locals.licence;

        const addressIndex = lastIndex(getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']));

        await licenceService.updateAddress({
            rawLicence,
            bookingId: bookingId,
            fieldMap: formConfig.curfewAddress.fields,
            userInput: req.body,
            index: addressIndex
        });

        const nextPath = formConfig.curfewAddress.nextPath.path;
        res.redirect(`${nextPath}${bookingId}`);
    }

    return {
        getAddress,
        postAddAddress,
        postUpdateAddress
    };
};
