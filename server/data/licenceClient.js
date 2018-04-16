const {resolveJsonResponse, resolveJsonColumn} = require('./dataAccess/azureJson');
const {getCollection, execSql} = require('./dataAccess/dbMethods');
const {licenceStages} = require('../models/licenceStages');
const TYPES = require('tedious').TYPES;

module.exports = {

    deleteAll: function() {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM LICENCES WHERE NOMIS_ID NOT LIKE '%XX'`;
            execSql(sql, null, resolve, reject);
        });
    },

    getLicences: function(nomisIds) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT NOMIS_ID as nomisId, ID as id, STAGE as stage, JSON_QUERY(LICENCE) AS licence 
                         FROM LICENCES WHERE NOMIS_ID IN (${nomisIds.map(id => `'${id}'`).join(',')}) FOR JSON PATH`;

            getCollection(sql, null, resolveJsonResponse(resolve), reject);
        });
    },

    getLicence: function(nomisId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT NOMIS_ID as nomisId, ID as id, STAGE as stage, JSON_QUERY(LICENCE) AS licence 
                         FROM LICENCES WHERE NOMIS_ID = '${nomisId}' FOR JSON PATH, WITHOUT_ARRAY_WRAPPER`;

            getCollection(sql, null, resolveJsonResponse(resolve), reject);
        });
    },

    createLicence: function(nomisId, licence = {}, stage = licenceStages.DEFAULT) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO LICENCES (NOMIS_ID, LICENCE, STAGE) ' +
                'VALUES (@nomisId, @licence, @stage)';

            const parameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify(licence)},
                {column: 'stage', type: TYPES.VarChar, value: stage}
            ];

            execSql(sql, parameters, resolve, reject);
        });
    },

    updateLicence: function(nomisId, licence = {}) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE LICENCES SET LICENCE = @licence WHERE NOMIS_ID=@nomisId';

            const parameters = [
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId},
                {column: 'licence', type: TYPES.VarChar, value: JSON.stringify(licence)}
            ];

            execSql(sql, parameters, resolve, reject);
        });
    },

    updateSection: function(section, nomisId, object) {
        return new Promise((resolve, reject) => {

            const sql = 'UPDATE LICENCES SET LICENCE = JSON_MODIFY(LICENCE, @section, JSON_QUERY(@object))' +
                ' WHERE NOMIS_ID=@nomisId';

            const parameters = [
                {column: 'section', type: TYPES.VarChar, value: '$.' + section},
                {column: 'object', type: TYPES.VarChar, value: JSON.stringify(object)},
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId}
            ];

            execSql(sql, parameters, resolve, reject);
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

    updateStage: function(nomisId, stage) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE LICENCES SET STAGE = @stage WHERE NOMIS_ID = @nomisId';

            const parameters = [
                {column: 'stage', type: TYPES.VarChar, value: stage},
                {column: 'nomisId', type: TYPES.VarChar, value: nomisId}
            ];

            execSql(sql, parameters, resolve, reject);
        });
    },

    getDeliusUserName: function(nomisUserName) {
        const sql = 'SELECT STAFF_ID FROM STAFF_IDS WHERE NOMIS_ID = @nomisUserName';

        return new Promise((resolve, reject) => {
            const parameters = [
                {column: 'nomisUserName', type: TYPES.VarChar, value: nomisUserName}
            ];

            getCollection(sql, parameters, resolve, reject);
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
            'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' AND ACTIVE = 1' +
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
        'WHERE CONDITIONS.TYPE = \'ADDITIONAL\' AND CONDITIONS.ID IN (\'' + idArray.join('\',\'') + '\') ' +
        'AND ACTIVE = 1' +
        'ORDER BY CONDITIONS.[GROUP], CONDITIONS.SUBGROUP';
};
