'use strict';

const {getCollection} = require('./dataAccess/licencesData');
const {resolveJsonResponse} = require('./dataAccess/azureJson');

exports.getOffenders = function(offenderManagerId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT JSON_QUERY(OFFENDERS) AS nomisIds
                     FROM DELIUS
                     WHERE OM_ID LIKE '${offenderManagerId}'
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER `;

        getCollection(sql, null, resolveJsonResponse(resolve), reject);
    });
};
