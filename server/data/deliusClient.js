const {getCollection} = require('./dataAccess/db');

module.exports = {
    getPrisonersFor: async function(userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT NOMS_NO FROM DELIUS WHERE STAFF_ID LIKE
            (SELECT STAFF_ID FROM STAFF_IDS WHERE NOMIS_ID LIKE '${userId}')`;

            getCollection(sql, null, parseSearchResponse(resolve), reject);
        });
    }
};

const parseSearchResponse = resolve => dbRows => {

    if (dbRows === 0) {
        return resolve([]);
    }

    resolve(dbRows.map(dbRow => dbRow.NOMS_NO.value));
};
