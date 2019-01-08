module.exports = {
    addressReviewStarted,
    isAcceptedAddress,
    isRejectedAddress
};

function isAcceptedAddress({consent, electricity}, addressSuitable, offenderIsOccupier) {
    if (offenderIsOccupier) {
        return electricity === 'Yes' && addressSuitable === 'Yes';
    }

    return consent === 'Yes' && electricity === 'Yes' && addressSuitable === 'Yes';
}

function isRejectedAddress({consent, electricity}, addressSuitable) {
    return consent === 'No' || electricity === 'No' || addressSuitable === 'No';
}

function addressReviewStarted({consent, electricity}) {
    return !!(consent || electricity);
}
