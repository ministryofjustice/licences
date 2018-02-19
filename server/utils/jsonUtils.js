const jp = require('jsonpath');
const {isEmpty} = require('../utils/functionalHelpers');

module.exports = {matcher, isPresent, isNotPresent, equalTo};


function matcher(json) {
    return {
        path: function(path, predicate) {
            return predicate(jp.value(json, '$.' + path));
        },
        value: function(path) {
            return jp.value(json, '$.' + path);
        }
    };
}

function isPresent(value) {
    return !isEmpty(value);
}

function isNotPresent(value) {
    return isEmpty(value);
}

function equalTo(expected) {
    return value => value === expected;
}

