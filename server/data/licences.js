'use strict';

const {getCollection} = require('./dataAccess/licencesData');

exports.getLicences = function(nomisIds) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT
                        NOMIS_ID as nomisId,
                        ID as id,
                        JSON_QUERY(LICENCE) AS licence
                     FROM LICENCES
                     WHERE NOMIS_ID IN (${nomisIds.map(id=> `'${id}'`).join(',')})
                     FOR JSON PATH`;

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
