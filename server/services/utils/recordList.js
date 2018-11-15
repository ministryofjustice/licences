const {getIn, addToArray, removeFromArray, replaceArrayItem, mergeWithRight, replacePath} = require('../../utils/functionalHelpers');

module.exports = (licence, path) => {

    const records = getIn(licence, path);

    if (!records) {
        throw new Error(`No records at path: ${path}`);
    }

    if (!Array.isArray(records)) {
        throw new Error(`No list at path: ${path}`);
    }

    return {
        add: modify(addRecord),
        remove: modify(removeRecord),
        edit: modify(editRecord)
    };

    function addRecord({record, records}) {
        return addToArray(record, records);
    }

    function removeRecord({records, index}) {
        return removeFromArray(index, 1, records);
    }

    function editRecord({record, records, index}) {
        if (!records[index]) {
            throw new Error(`No record to update: ${index}`);
        }

        const editedRecord = mergeWithRight(records[index], record);
        return replaceArrayItem(records, index, editedRecord);
    }

    function modify(updateMethod) {
        return ({record = null, index = null} = {}) => {
            const newRecords = updateMethod({record, records, index});
            return replacePath(path, newRecords, licence);
        };
    }
};

