const {isEmpty, filterAllButLast} = require('./functionalHelpers');

module.exports = {separateAddresses, addressReviewStarted, getAddressToShow};

function separateAddresses(addressList) {
    return addressList
        .map((address, index) => ({...address, index: String(index)}))
        .reduce((dataObject, address) => {

            const {consent, electricity, alternative} = address;
            const deemedSafe = address.deemedSafe || '';

            if(alternative) {
                return {
                    ...dataObject,
                    alternativeAddresses: [...dataObject.alternativeAddresses, address]
                };
            }

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
        }, {activeAddresses: [], acceptedAddresses: [], rejectedAddresses: [], alternativeAddresses: []});
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

    return filterAllButLast(rejectedAddresses);
}

