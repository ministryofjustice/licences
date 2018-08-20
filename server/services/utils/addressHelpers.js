const {getIn, replaceArrayItem, mergeWithRight, removeFromArray} = require('../../utils/functionalHelpers');

module.exports = {
    update: editAddressesArray(updateAddressInArray),
    add: editAddressesArray(addAddressToArray)
};

function editAddressesArray(updateMethod) {
    return ({bookingId, licence, newAddress, index = null} = {}) => {
        return updateAddressesInLicence({
            updateMethod,
            licence,
            newAddress,
            index
        });
    };
}

function updateAddressesInLicence({updateMethod, licence, newAddress, index = null} = {}) {

    const addresses = getIn(licence, ['proposedAddress', 'curfewAddress', 'addresses']);

    const newAddresses = updateMethod({addresses, index, newAddress});

    return {
        ...licence,
        proposedAddress: {
            ...licence.proposedAddress,
            curfewAddress: {
                ...licence.proposedAddress.curfewAddress,
                addresses: newAddresses
            }
        }
    };
}

function updateAddressInArray({addresses, index, newAddress}) {
    if (!addresses[index]) {
        throw new Error('No address to update: '+index);
    }

    if (!newAddress) {
        return removeFromArray(index, 1, addresses);
    }

    const newAddressObject = mergeWithRight(addresses[index], newAddress);
    return replaceArrayItem(addresses, index, newAddressObject);
}

function addAddressToArray({addresses, newAddress}) {
    return [...addresses, newAddress];
}
