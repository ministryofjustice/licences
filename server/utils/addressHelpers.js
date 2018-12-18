module.exports = {
    addressReviewStarted,
    isAcceptedAddress,
    isRejectedAddress
};

function isAcceptedAddress(addressReview, addressSafety, offenderIsOccupier) {
    const {consent, electricity} = addressReview;
    const {deemedSafe} = addressSafety;

    if (offenderIsOccupier) {
        return electricity === 'Yes' && deemedSafe === 'Yes';
    }

    return consent === 'Yes' && electricity === 'Yes' && deemedSafe === 'Yes';
}

function isRejectedAddress(addressReview, addressSafety) {
    const {consent, electricity} = addressReview;
    const {deemedSafe} = addressSafety;

    return consent === 'No' || electricity === 'No' || deemedSafe === 'No';
}

function addressReviewStarted(addressReview, addressSafety) {
    const {consent, electricity} = addressReview;
    const {deemedSafe} = addressSafety;

    return !!(consent || electricity || deemedSafe);
}
