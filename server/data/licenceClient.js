const {licenceStages} = require('../models/licenceStages');
const db = require('./dataAccess/db');

module.exports = {

    deleteAll: function() {
        return db.query(`delete from licences where booking_id != 1200635; 
        delete from licence_versions where booking_id != 1200635`);
    },

    deleteAllTest: function() {
        return db.query(`delete from licences where booking_id < 23 or booking_id = '1200635'; 
          delete from licence_versions where booking_id < 23 or booking_id = '1200635'`);
    },

    getLicences: async function(bookingIds) {
        const query = {
            text: `select licence, booking_id, stage, version from licences 
                   where booking_id in (${bookingIds.map(id => `'${id}'`).join(',')})`
        };

        const {rows} = await db.query(query);
        return rows;
    },

    getLicence: async function(bookingId) {
        const query = {
            text: `select licence, booking_id, stage, version from licences where booking_id = $1`,
            values: [bookingId]
        };

        const {rows} = await db.query(query);

        if (rows) {
            return rows[0];
        }

        return {};
    },

    getApprovedLicenceVersion: async function(bookingId) {
        const query = {
            text: `select version, template, timestamp from licence_versions 
                    where booking_id = $1 order by version desc limit 1`,
            values: [bookingId]
        };

        const {rows} = await db.query(query);

        if (rows && rows[0]) {
            return rows[0];
        }

        return null;
    },

    createLicence: function(bookingId, licence = {}, stage = licenceStages.DEFAULT, version = 1) {
        const query = {
            text: 'insert into licences (booking_id, licence, stage, version) values ($1, $2, $3, $4)',
            values: [bookingId, licence, stage, version]
        };

        return db.query(query);
    },

    updateLicence: function(bookingId, licence = {}) {
        const query = {
            text: 'update licences set licence = $1 where booking_id=$2',
            values: [licence, bookingId]
        };

        return db.query(query);
    },

    updateSection: function(section, bookingId, object) {
        const path = '{licenceConditions}';

        const query = {
            text: 'update licences set licence = jsonb_set(licence, $1, $2) where booking_id=$3',
            values: [path, object, bookingId]
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

    updateStage: function(bookingId, stage) {
        const query = {
            text: 'update licences set stage = $1 where booking_id = $2',
            values: [stage, bookingId]
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
    },

    saveApprovedLicenceVersion: function(bookingId, template) {
        const query = {
            text: `insert into licence_versions (booking_id, licence, version, template)
                    select booking_id, licence, version, $1
                    from licences where booking_id = $2`,
            values: [template, bookingId]
        };

        return db.query(query);
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
