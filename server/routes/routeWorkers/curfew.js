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

            // to do - use explicit action instead of working it out
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


    return {
        getCurfewAddressReview: addressReviewGets('curfewAddressReview'),
        postCurfewAddressReview: addressReviewPosts('curfewAddressReview'),

        getAddressSafetyReview: addressReviewGets('addressSafety'),
        postAddressSafetyReview: addressReviewPosts('addressSafety'),

        postWithdrawAddress: addressReviewPosts('withdrawAddress'),
        postWithdrawConsent: addressReviewPosts('withdrawConsent'),
        postReinstateAddress: addressReviewPosts('reinstateAddress')
    };
};
