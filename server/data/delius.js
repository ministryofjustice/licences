'use strict';

const {getCollection} = require('./dataAccess/licencesData');

exports.getOffenders = function(offenderManagerId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT JSON_QUERY(OFFENDERS) AS nomisIds
                     FROM DELIUS
                     WHERE OM_ID LIKE '${offenderManagerId}'
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER `;

        getCollection(sql, null, resolveJsonResponse(resolve), reject);
    });
};

const resolveJsonResponse = resolve => response => {
    if(response === 0) {
        return resolve([]);
    }

    const concatenatedResponse = response.map(valueOfJsonSegment).join('');
    resolve(JSON.parse(concatenatedResponse));
};

const valueOfJsonSegment = responseSegment => {
    return Object.keys(responseSegment).reduce((segmentString, segmentKey) => {
        if (segmentKey.includes('JSON')) {
            return segmentString.concat(responseSegment[segmentKey].value);
        }
        return segmentString;
    }, '');
};
