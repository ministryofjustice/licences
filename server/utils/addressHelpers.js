const {getIn} = require('../utils/functionalHelpers');

module.exports = {
    addressReviewStarted,
    isWithdrawnAddress,
    isAcceptedAddress,
    isRejectedAddress
};

function isWithdrawnAddress(address) {
    const {addressWithdrawn, consentWithdrawn} = address;

    return addressWithdrawn === 'Yes' || consentWithdrawn === 'Yes';
}

function isAcceptedAddress(address) {
    const {consent, electricity, occupier} = address;
    const deemedSafe = address.deemedSafe || '';

    if (getIn(occupier, ['isOffender']) === 'Yes') {
        return electricity === 'Yes' && deemedSafe === 'Yes';
    }

    return consent === 'Yes' && electricity === 'Yes' && deemedSafe === 'Yes';
}

function isRejectedAddress(address) {
    const {consent, electricity, deemedSafe} = address;

    return consent === 'No' || electricity === 'No' || deemedSafe === 'No';
}

function addressReviewStarted(address) {
    const {consent, electricity, deemedSafe} = address;
    return !!(consent || electricity || deemedSafe);
}
