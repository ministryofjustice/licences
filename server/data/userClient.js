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
            text: 'select nomis_id, staff_id, first_name, last_name from staff_ids'
        };

        const {rows} = await db.query(query);

        return rows;
    }
};

