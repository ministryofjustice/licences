const recordList = require('./recordList');
const addressesPath = ['proposedAddress', 'curfewAddress', 'addresses'];

module.exports = {
    update: edit,
    add
};

function edit({licence, index, newAddress}) {
    if (!newAddress) {
        return recordList(licence, addressesPath).remove({index});
    }

    return recordList(licence, addressesPath).edit({index, record: newAddress});
}

function add({licence, newAddress}) {
    return recordList(licence, addressesPath).add({record: newAddress});
}
