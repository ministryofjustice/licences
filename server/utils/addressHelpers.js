const {isEmpty, lastItem} = require('./functionalHelpers');

module.exports = {
    addressReviewStarted,
    getCurfewAddressFormData,
    isWithdrawnAddress,
    isAcceptedAddress,
    isRejectedAddress
};

function getCurfewAddressFormData(addressList) {

    const candidate = lastItem(addressList);

    if (isEmpty(addressList)) {
        return {submitPath: null, addressToShow: {}};
    }

    if (isRejectedAddress(candidate) || isWithdrawnAddress(candidate)) {
        return {submitPath: '/hdc/proposedAddress/curfewAddress/add/', addressToShow: {}};
    }

    return {submitPath: '/hdc/proposedAddress/curfewAddress/update/', addressToShow: candidate};
}

function isWithdrawnAddress(address) {
    const {addressWithdrawn, consentWithdrawn} = address;

    return addressWithdrawn === 'Yes' || consentWithdrawn === 'Yes';
}

function isAcceptedAddress(address) {
    const {consent, electricity} = address;
    const deemedSafe = address.deemedSafe || '';

    return consent === 'Yes' && electricity === 'Yes' && deemedSafe.startsWith('Yes');
}

function isRejectedAddress(address) {
    const {consent, electricity, deemedSafe} = address;

    return consent === 'No' || electricity === 'No' || deemedSafe === 'No';
}

function addressReviewStarted(address) {
    const {consent, electricity, deemedSafe} = address;
    return !!(consent || electricity || deemedSafe);
}
