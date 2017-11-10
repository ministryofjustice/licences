const {resolveJsonResponse, resolveJsonColumn} = require('./dataAccess/azureJson');
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
            const sql = `SELECT NOMIS_ID as nomisId, ID as id, STATUS as status, JSON_QUERY(LICENCE) AS licence 
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

        const sql = additionalConditionsSql(ids);

        return new Promise((resolve, reject) => {
            getCollection(sql, null, resolveJsonColumn(resolve, 'FIELD_POSITION'), reject);
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
        return 'SELECT ' +
               '  CONDITIONS.*, ' +
               '  CONDITIONS_UI.FIELD_POSITION, ' +
               '  GROUPS.NAME AS GROUP_NAME, ' +
               '  SUBGROUPS.NAME AS SUBGROUP_NAME ' +
               'FROM CONDITIONS ' +
               'LEFT JOIN CONDITIONS_UI ON CONDITIONS.USER_INPUT = CONDITIONS_UI.UI_ID ' +
               'LEFT JOIN CONDITIONS_GROUPS GROUPS ON CONDITIONS.[GROUP] = GROUPS.ID ' +
               'LEFT JOIN CONDITIONS_GROUPS SUBGROUPS ON CONDITIONS.SUBGROUP = SUBGROUPS.ID ' +
               'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' ' +
               'ORDER BY CONDITIONS.[GROUP], CONDITIONS.SUBGROUP';
    }

    return 'SELECT ' +
           '  CONDITIONS.*, ' +
           '  CONDITIONS_UI.FIELD_POSITION, ' +
           '  GROUPS.NAME AS GROUP_NAME, ' +
           '  SUBGROUPS.NAME AS SUBGROUP_NAME ' +
           'FROM CONDITIONS ' +
           'LEFT JOIN CONDITIONS_UI ON CONDITIONS.USER_INPUT = CONDITIONS_UI.UI_ID ' +
           'LEFT JOIN CONDITIONS_GROUPS GROUPS ON CONDITIONS.[GROUP] = GROUPS.ID ' +
           'LEFT JOIN CONDITIONS_GROUPS SUBGROUPS ON CONDITIONS.SUBGROUP = SUBGROUPS.ID ' +
           'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' AND CONDITIONS.ID IN (' + idArray.join(',') + ') ' +
           'ORDER BY CONDITIONS.[GROUP], CONDITIONS.SUBGROUP';
};
