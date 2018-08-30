const db = require('./dataAccess/db');

module.exports = {

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

    getRoUsers: async function() {

        const query = {
            text: 'select nomis_id, staff_id, first_name, last_name from staff_ids order by nomis_id asc'
        };

        const {rows} = await db.query(query);

        return rows;
    },

    getRoUser: async function(nomisId) {

        const query = {
            text: 'select nomis_id, staff_id, first_name, last_name from staff_ids where nomis_id = $1',
            values: [nomisId]
        };

        const {rows} = await db.query(query);

        return rows[0];
    },

    updateRoUser: async function(nomisId, deliusId, first, last) {

        const query = {
            text: `update staff_ids set staff_id = $2, first_name = $3, last_name = $4 where nomis_id = $1`,
            values: [nomisId, deliusId, first, last]
        };

        return db.query(query);
    },

    deleteRoUser: async function(nomisId) {

        const query = {
            text: 'delete from staff_ids where nomis_id = $1',
            values: [nomisId]
        };

        return db.query(query);
    },

    addRoUser: async function(nomisId, deliusId, first, last) {

        const query = {
            text: 'insert into staff_ids (nomis_id, staff_id, first_name, last_name) values($1, $2, $3, $4)',
            values: [nomisId, deliusId, first, last]
        };

        return db.query(query);
    },

    findRoUsers: async function(searchTerm) {

        const query = {
            text: `select nomis_id, staff_id, first_name, last_name from staff_ids 
                where 
                    upper(nomis_id) like upper($1) or 
                    upper(staff_id) like upper($1) or
                    upper(first_name) like upper($1) or
                    upper(last_name) like upper($1) 
                order by nomis_id asc`,
            values: [`%${searchTerm}%`]
        };

        const {rows} = await db.query(query);

        return rows;
    }
};

