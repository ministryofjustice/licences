const db = require('./dataAccess/db');
const setCase = require('case');

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
            text: 'select * from staff_ids order by nomis_id asc'
        };

        const {rows} = await db.query(query);

        return rows.map(convertPropertyNames);
    },

    getRoUser: async function(nomisId) {

        const query = {
            text: 'select * from staff_ids where nomis_id = $1',
            values: [nomisId]
        };

        const {rows} = await db.query(query);

        return convertPropertyNames(rows[0]);
    },

    getRoUserByDeliusId: async function(deliusId) {

        const query = {
            text: 'select * from staff_ids where staff_id = $1',
            values: [deliusId]
        };

        const {rows} = await db.query(query);

        return convertPropertyNames(rows[0]);
    },

    updateRoUser: async function(
        originalNomisId, nomisId, deliusId, first, last, organisation, jobRole, email, telephone) {

        const query = {
            text: `update staff_ids 
                    set nomis_id = $2, staff_id = $3, first_name = $4, last_name = $5, 
                    organisation = $6, job_role = $7, email = $8, telephone = $9 
                    where nomis_id = $1`,
            values: [originalNomisId, nomisId, deliusId, first, last, organisation, jobRole, email, telephone]
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

    addRoUser: async function(nomisId, deliusId, first, last, organisation, jobRole, email, telephone) {

        const query = {
            text: `insert into staff_ids
                (nomis_id, staff_id, first_name, last_name, organisation, job_role, email, telephone)
                values($1, $2, $3, $4, $5, $6, $7, $8)`,
            values: [nomisId, deliusId, first, last, organisation, jobRole, email, telephone]
        };

        return db.query(query);
    },

    findRoUsers: async function(searchTerm) {

        const query = {
            text: `select * from staff_ids 
                where 
                    upper(nomis_id) like upper($1) or 
                    upper(staff_id) like upper($1) or
                    upper(first_name) like upper($1) or
                    upper(last_name) like upper($1) or
                    upper(organisation) like upper($1) or
                    upper(job_role) like upper($1) or
                    upper(email) like upper($1) or
                    upper(telephone) like upper($1)
                order by nomis_id asc`,
            values: [`%${searchTerm}%`]
        };

        const {rows} = await db.query(query);

        return rows.map(convertPropertyNames);
    }
};

function convertPropertyNames(user) {
    return user ? {
        nomisId: user.nomis_id,
        deliusId: setCase.upper(user.staff_id),
        first: setCase.capital(user.first_name),
        last: setCase.capital(user.last_name),
        organisation: setCase.capital(user.organisation),
        jobRole: setCase.capital(user.job_role),
        email: setCase.lower(user.email),
        telephone: user.telephone
    } : null;
}

