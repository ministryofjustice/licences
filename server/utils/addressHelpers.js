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
