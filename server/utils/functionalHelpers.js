const R = require('ramda');

module.exports = {
    getIn,
    getIntersection,
    isEmpty,
    flatten
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
