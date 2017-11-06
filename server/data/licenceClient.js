const {resolveJsonResponse} = require('./dataAccess/azureJson');
const {getCollection, addRow} = require('./dataAccess/dbMethods');
const TYPES = require('tedious').TYPES;

module.exports = {
    getLicences: function(nomisIds) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT NOMIS_ID as nomisId, ID as id, STATUS as status, JSON_QUERY(LICENCE) AS licence 
                         FROM LICENCES WHERE NOMIS_ID IN (${nomisIds.map(id => `'${id}'`).join(',')}) FOR JSON PATH`;

            getCollection(sql, null, resolveJsonResponse(resolve), reject);
        });
    },

    getLicence: function(nomisId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT NOMIS_ID as nomisId, ID as id, JSON_QUERY(LICENCE) AS licence 
                         FROM LICENCES WHERE NOMIS_ID = '${nomisId}' FOR JSON PATH, WITHOUT_ARRAY_WRAPPER`;

            getCollection(sql, null, resolveJsonResponse(resolve), reject);
        });
    },

    createLicence: function(nomisId, licence = {}, status = 'STARTED') {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO LICENCES (NOMIS_ID, LICENCE, STATUS) ' +
                'VALUES (@nomisId, @licence, @status)';

            const parameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify(licence)},
                {column: 'status', type: TYPES.VarChar, value: status}
            ];

            addRow(sql, parameters, resolve, reject);
        });
    },

    updateSection: function(section, nomisId, object) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE LICENCES 
                         SET LICENCE = JSON_MODIFY(LICENCE, @section, JSON_QUERY(@object)) 
                         WHERE NOMIS_ID=@nomisId`;

            const parameters = [
                {column: 'section', type: TYPES.VarChar, value: '$.' + section},
                {column: 'object', type: TYPES.VarChar, value: JSON.stringify(object)},
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId}
            ];

            addRow(sql, parameters, resolve, reject);
        });
    },

    getStandardConditions: function() {
        return new Promise((resolve, reject) => {
            const sql = 'select * from CONDITIONS Where TYPE = \'STANDARD\'';

            getCollection(sql, null, resolve, reject);
        });
    },

    getAdditionalConditions: function(ids = []) {

        const {sql, parameters} = additionalConditionsSql(ids);

        return new Promise((resolve, reject) => {
            getCollection(sql, parameters, resolve, reject);
        });
    },

    updateStatus: function(nomisId, status) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE LICENCES SET STATUS = @status WHERE NOMIS_ID = @nomisId';

            const parameters = [
                {column: 'status', type: TYPES.VarChar, value: status},
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId}
            ];

            addRow(sql, parameters, resolve, reject);
        });
    }
};

const additionalConditionsSql = ids => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    if (idArray.length === 0) {
        return {
            sql: 'select * from CONDITIONS Where TYPE = \'ADDITIONAL\'',
            parameters: null
        };
    }

    return {
        sql: 'select * from CONDITIONS Where TYPE = \'ADDITIONAL\' AND ID IN (@conditionIds)',
        parameters: [{column: 'conditionIds', type: TYPES.Int, value: `${idArray.join(', ')}`}]
    };
};
