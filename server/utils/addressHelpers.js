module.exports = {
    isAcceptedAddress
};

function isAcceptedAddress({consent, electricity}, addressSuitable, offenderIsOccupier) {
    if (offenderIsOccupier) {
        return electricity === 'Yes' && addressSuitable === 'Yes';
    }

    return consent === 'Yes' && electricity === 'Yes' && addressSuitable === 'Yes';
}
