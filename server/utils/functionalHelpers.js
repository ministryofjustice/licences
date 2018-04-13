const R = require('ramda');

module.exports = {
    getIn,
    getIntersection,
    isEmpty,
    flatten,
    notAllValuesEmpty,
    allValuesEmpty,
    getFirstArrayItems,
    replaceArrayItem,
    filterAllButLast
};

// pass in your object and a path in array format
// http://ramdajs.com/docs/#path
function getIn(object, pathArray) {
    return R.path(pathArray, object);
}

function getIntersection(array1, array2) {
    return R.intersection(array1, array2);
}

function isEmpty(item) {
    return R.isEmpty(item) || R.isNil(item);
}

function flatten(array) {
    return R.flatten(array);
}

function allValuesEmpty(object) {
    return R.pipe(R.values, R.all(isEmpty))(object);
}

function notAllValuesEmpty(object) {
    return !allValuesEmpty(object);
}

function getFirstArrayItems(array, number) {
    return R.slice(0, number, array);
}

function replaceArrayItem(array, index, item) {
    return R.update(parseInt(index))(item)(array);
}

function filterAllButLast(array) {
    return R.takeLast(1, array);
}
