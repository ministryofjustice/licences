'use strict';

const {getCollection} = require('./dataAccess/dbData');
const {resolveJsonResponse} = require('./dataAccess/azureJson');

exports.getLicences = function(nomisIds) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT NOMIS_ID as nomisId, ID as id, JSON_QUERY(LICENCE) AS licence
                     FROM LICENCES WHERE NOMIS_ID IN (${nomisIds.map(id=> `'${id}'`).join(',')}) FOR JSON PATH`;

        getCollection(sql, null, resolveJsonResponse(resolve), reject);
    });
};


