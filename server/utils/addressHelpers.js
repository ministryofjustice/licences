const {isEmpty} = require('./functionalHelpers');

module.exports = {separateAddresses, addressReviewStarted, getAddressToShow};

function separateAddresses(addressList) {
    return addressList
        .map((address, index) => ({...address, index: String(index)}))
        .filter(address => !address.alternative)
        .reduce((dataObject, address) => {

            const {consent, electricity} = address;
            const deemedSafe = address.deemedSafe || '';

            if(consent === 'Yes' && electricity === 'Yes' && deemedSafe.startsWith('Yes')) {
                return {
                    ...dataObject,
                    acceptedAddresses: [...dataObject.acceptedAddresses, address]
                };
            }

            if (!consent || consent === 'Yes' && !deemedSafe) {
                return {
                    ...dataObject,
                    activeAddresses: [...dataObject.activeAddresses, address]
                };
            }

            if (consent === 'No' || electricity === 'No' || deemedSafe === 'No') {
                return {
                    ...dataObject,
                    rejectedAddresses: [...dataObject.rejectedAddresses, address]
                };
            }

            return dataObject;
        }, {activeAddresses: [], acceptedAddresses: [], rejectedAddresses: []});
}

function addressReviewStarted(address) {
    const {consent, electricity, deemedSafe} = address;
    return !!(consent || electricity || deemedSafe);
}

function getAddressToShow(activeAddresses, acceptedAddresses, rejectedAddresses) {
    if(!isEmpty(activeAddresses)) {
        return activeAddresses;
    }

    if(!isEmpty(acceptedAddresses)) {
        return acceptedAddresses;
    }

    return [rejectedAddresses[rejectedAddresses.length-1]];
}

