const {getIn, addToArray, removeFromArray, replaceArrayItem, mergeWithRight, replacePath, lastIndex, isEmpty}
    = require('../../utils/functionalHelpers');

module.exports = ({licence, path, allowEmpty = false} = {}) => {

    const records = getIn(licence, path);

    if (!allowEmpty && !records) {
        throw new Error(`No records at path: ${path}`);
    }

    if (records && !Array.isArray(records)) {
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

    function editRecord({record, records, index = 0} = {}) {

        const selector = !isEmpty(index) ? index : lastIndex(records);
        const previous = !isEmpty(index) ? records[index] : records[selector];

        if (isEmpty(previous)) {
            throw new Error(`No record to update: ${selector}`);
        }

        const editedRecord = mergeWithRight(previous, record);
        return replaceArrayItem(records, selector, editedRecord);
    }

    function modify(updateMethod) {
        return ({record = null, index = null} = {}) => {
            const newRecords = updateMethod({record, records, index});
            return replacePath(path, newRecords, licence);
        };
    }
};

