const logger = require('../../../log');
const {getPathFor} = require('../../utils/routes');
const {getIn, lastItem, lastIndex} = require('../../utils/functionalHelpers');

module.exports = ({formConfig, licenceService}) => {

    function addressReviewGets(formName) {
        return (req, res) => {
            const {bookingId} = req.params;

            const addresses = getIn(res.locals.licence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const data = lastItem(addresses);
            const nextPath = formConfig[formName].nextPath;

            res.render(`curfew/${formName}`, {bookingId, data, nextPath});
        };
    }

    function addressReviewPosts(formName) {
        return async (req, res) => {
            const {bookingId} = req.params;
            logger.debug(`POST /curfew/${formName}/${bookingId}`);

            const rawLicence = res.locals.licence;
            const addresses = getIn(rawLicence, ['licence', 'proposedAddress', 'curfewAddress', 'addresses']);
            const addressIndex = lastIndex(addresses);
            const modifyingLicence = ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(rawLicence.stage);
            const nextPath = modifyingLicence ? '/hdc/taskList/' :
                getPathFor({data: req.body, config: formConfig[formName]});

            await licenceService.updateAddress({
                rawLicence,
                bookingId,
                fieldMap: formConfig[formName].fields,
                userInput: req.body,
                index: addressIndex
            });

            res.redirect(`${nextPath}${bookingId}`);
        };
    }

    return {
        getCurfewAddressReview: addressReviewGets('curfewAddressReview'),
        getAddressSafetyReview: addressReviewGets('addressSafety'),

        postCurfewAddressReview: addressReviewPosts('curfewAddressReview'),
        postAddressSafetyReview: addressReviewPosts('addressSafety'),
        postWithdrawAddress: addressReviewPosts('withdrawAddress'),
        postWithdrawConsent: addressReviewPosts('withdrawConsent'),
        postReinstateAddress: addressReviewPosts('reinstateAddress')
    };
};
