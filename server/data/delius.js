'use strict';

const {getCollection} = require('./dataAccess/dbData');

exports.getOffenders = function(offenderManagerId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT NOMS_NO FROM DELIUS
                        WHERE STAFF_ID like '${offenderManagerId}'`;

        getCollection(sql, null, parseSearchResponse(resolve), reject);
    });
};


const parseSearchResponse = resolve => dbRows => {

    if(dbRows === 0) {
        return resolve([]);
    }

    resolve(dbRows.map(dbRow => dbRow.NOMS_NO.value));
};
