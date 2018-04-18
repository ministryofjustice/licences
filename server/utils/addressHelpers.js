const {isEmpty, lastItem} = require('./functionalHelpers');

module.exports = {
    addressReviewStarted,
    getCandidateAddress,
    getCurfewAddressFormData,
    isAcceptedAddress,
    isRejectedAddress
};

function getCandidateAddress(addressList) {

    const candidate = lastItem(addressList);

    if(isActiveAddress(candidate)) {
        return candidate;
    }

    return null;
}

function getCurfewAddressFormData(addressList) {

    const candidate = lastItem(addressList);

    if(isEmpty(addressList)) {
        return {submitPath: null, addressToShow: {}};
    }

    if(isActiveAddress(candidate)) {
        return {submitPath: '/hdc/proposedAddress/curfewAddress/update/', addressToShow: candidate};
    }

    if(isRejectedAddress(candidate)) {
        return {submitPath: '/hdc/proposedAddress/curfewAddress/add/', addressToShow: {}};
    }
}

function isActiveAddress(address) {
    const {consent, deemedSafe} = address;
    return !consent || consent === 'Yes' && !deemedSafe;
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
