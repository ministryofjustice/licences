const {licenceStages} = require('../models/licenceStages');
const db = require('./dataAccess/db');

module.exports = {

    deleteAll: function() {
        return db.query(`delete from licences where nomis_id not like '%XX'`);
    },

    deleteAllTest: function() {
        return db.query(`delete from licences where nomis_id like '%XX' or nomis_id like 'A5001DY'`);
    },

    getLicences: async function(nomisIds) {
        const query = {
            text: `select licence, nomis_id, stage from licences 
                   where nomis_id in (${nomisIds.map(id => `'${id}'`).join(',')})`
        };

        const {rows} = await db.query(query);
        return rows;
    },

    getLicence: async function(nomisId) {
        const query = {
            text: `select licence, nomis_id, stage from licences where nomis_id = $1`,
            values: [nomisId]
        };

        const {rows} = await db.query(query);

        if (rows) {
            return rows[0];
        }

        return {};
    },

    createLicence: function(nomisId, licence = {}, stage = licenceStages.DEFAULT) {
        const query = {
            text: 'insert into licences (nomis_id, licence, stage) values ($1, $2, $3)',
            values: [nomisId, licence, stage]
        };

        return db.query(query);
    },

    updateLicence: function(nomisId, licence = {}) {
        const query = {
            text: 'update licences set licence = $1 where nomis_id=$2',
            values: [licence, nomisId]
        };

        return db.query(query);
    },

    updateSection: function(section, nomisId, object) {
        const path = '{licenceConditions}';

        const query = {
            text: 'update licences set licence = jsonb_set(licence, $1, $2) where nomis_id=$3',
            values: [path, object, nomisId]
        };

        return db.query(query);
    },

    getStandardConditions: async function() {
        const {rows} = await db.query(`select * from conditions Where type = 'STANDARD'`);
        return rows;
    },

    getAdditionalConditions: async function(ids = []) {
        const {rows} = await db.query(additionalConditionsSql(ids));
        return rows;
    },

    updateStage: function(nomisId, stage) {
        const query = {
            text: 'update licences set stage = $1 where nomis_id = $2',
            values: [stage, nomisId]
        };

        return db.query(query);
    },

    getDeliusUserName: async function(nomisUserName) {
        const query = {
            text: 'select staff_id from staff_ids where nomis_id = $1',
            values: [nomisUserName]
        };

        const {rows} = await db.query(query);

        if (rows[0]) {
            return rows[0].staff_id;
        }

        return undefined;
    }
};

const additionalConditionsSql = ids => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    if (idArray.length === 0) {
        return 'select ' +
            '  conditions.*, ' +
            '  conditions_ui.field_position, ' +
            '  groups.name as group_name, ' +
            '  subgroups.name as subgroup_name ' +
            'from conditions ' +
            'left join conditions_ui on conditions.user_input = conditions_ui.ui_id ' +
            'left join conditions_groups groups on conditions.group = groups.id ' +
            'left join conditions_groups subgroups on conditions.subgroup = subgroups.id ' +
            'where conditions.type = \'ADDITIONAL\' and active = true ' +
            'order by conditions.group, conditions.subgroup';
    }

    return 'select ' +
        '  conditions.*, ' +
        '  conditions_ui.field_position, ' +
        '  groups.name as group_name, ' +
        '  subgroups.name as subgroup_name ' +
        'from conditions ' +
        'left join conditions_ui on conditions.user_input = conditions_ui.ui_id ' +
        'left join conditions_groups groups on conditions.group = groups.id ' +
        'left join conditions_groups subgroups on conditions.subgroup = subgroups.id ' +
        'where conditions.type = \'ADDITIONAL\' and conditions.id in (\'' + idArray.join('\',\'') + '\') ' +
        'and active = true ' +
        'order by conditions.group, conditions.subgroup';
};
