const {getIn, addToArray, removeFromArray, replaceArrayItem, mergeWithRight, replacePath, lastIndex, isEmpty, lastItem}
    = require('../../utils/functionalHelpers');

module.exports = ({licence, path, allowEmpty = false} = {}) => {

    const records = getIn(licence, path);

    if (!allowEmpty && isEmpty(records)) {
        throw new Error(`No records at path: ${path}`);
    }

    if (records && !Array.isArray(records)) {
        throw new Error(`No list at path: ${path}`);
    }

    return {
        add: modify(addRecord),
        remove: modify(removeRecord),
        edit: modify(editRecord),
        records,
        last
    };

    function last() {
        return records ? lastItem(records) : undefined;
    }

    function addRecord({record, records}) {
        return addToArray(record, records);
    }

    function removeRecord({record, records, index = 0} = {}) {
        const selector = !isEmpty(index) ? index : lastIndex(records);
        return removeFromArray(selector, 1, records);
    }

    function editRecord({record, records, index = 0} = {}) {

        const selector = !isEmpty(index) ? index : lastIndex(records);
        const previous = records[selector];

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

