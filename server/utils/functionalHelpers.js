const R = require('ramda');

module.exports = {
    getIn,
    isEmpty,
    flatten,
    notAllValuesEmpty,
    allValuesEmpty,
    replaceArrayItem,
    lastItem,
    merge,
    mergeWithRight,
    firstItem,
    lastIndex,
    removePath,
    removePaths,
    replacePath,
    interleave,
    equals,
    difference,
    getUniqueStrings,
    pipe,
    removeFromArray,
    addToArray,
    all,
    getWhereKeyLike,
    pickKey,
    firstKey,
    getFieldDetail,
    getFieldName,
    pick: R.pick,
    pickBy: R.pickBy,
    addPaths,
    keys: R.keys
};

// pass in your object and a path in array format
// http://ramdajs.com/docs/#path
function getIn(object, pathArray) {
    return R.path(pathArray, object);
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

function all(predicate, array) {
    return R.all(predicate)(array);
}

function notAllValuesEmpty(object) {
    return !allValuesEmpty(object);
}

function replaceArrayItem(array, index, item) {
    return R.update(parseInt(index))(item)(array);
}

function lastItem(array) {
    return R.last(array);
}

function firstItem(array) {
    return R.head(array);
}

function merge(...args) {
    return R.merge(...args);
}

function pipe(...args) {
    return R.pipe(...args);
}

// uses the value on object2 if it key exists on both
function mergeWithRight(object1, object2) {
    return R.mergeDeepRight(object1, object2);
}

function lastIndex(array) {
    return array.length - 1;
}

// pass in path and an object. Using ...args enables currying
function removePath(...args) {
    return R.dissocPath(...args);
}

function removePaths(arrayOfPaths, object) {
    const dissocPath = (object, path) => R.dissocPath(path, object);
    return R.reduce(dissocPath, object)(arrayOfPaths);
}

function addPaths(arrayOfPathValueTuples, object) {
    const assocPath = (object, tuple) => R.assocPath(tuple[0], tuple[1], object);
    return R.reduce(assocPath, object)(arrayOfPathValueTuples);
}

function replacePath(path, val, object) {
    return R.assocPath(path, val, object);
}

function interleave(firstArray, secondArray) {
    return flatten(firstArray
        .map((item, index) => [item, secondArray[index] || '']))
        .join('');
}

// arguments can be objects or arrays
function equals(firstItem, secondItem) {
    return R.equals(firstItem, secondItem);
}

function difference(firstArray, secondArray) {
    return R.difference(firstArray, secondArray);
}

function getUniqueStrings(array) {
    const isNotEmpty = item => item.trim();
    return R.pipe(
        R.flatten,
        R.uniq,
        R.filter(isNotEmpty)
    )(array);
}

function removeFromArray(index, end, array) {
    return R.remove(index, end, array);
}

function addToArray(element, array) {
    return R.append(element, array);
}

function getWhereKeyLike(string, object) {
    const stringIncludesKey = (value, key) => {
        const lowerCaseString = string.toLowerCase();
        return lowerCaseString.includes(key.toLowerCase());
    };

    return R.pipe(
        R.pickBy(stringIncludesKey),
        R.values
    )(object)[0];
}

function pickKey(predicate, object) {
    return R.pipe(
        R.pickBy(predicate),
        R.keys,
    )(object)[0];
}

function firstKey(object) {
    return R.keys(object)[0];
}

function getFieldDetail(fieldPath, fieldConfig) {
    return R.pipe(
        R.values,
        R.head,
        R.path(fieldPath)
    )(fieldConfig);
}

function getFieldName(fieldConfig) {
    return R.pipe(
        R.keys,
        R.head
    )(fieldConfig);
}
