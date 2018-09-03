const logger = require('../../log');
const db = require('./dataAccess/db');

const keys = [
    'LOGIN',
    'LICENCE_RECORD_STARTED',
    'UPDATE_SECTION',
    'SEND',
    'CREATE_PDF'
];

module.exports = {

    record: function(key, user, data) {

        if (!keys.includes(key)) {
            throw new Error(`Unknown audit key: ${key}`);
        }

        logger.audit('AUDIT', {key});

        return addItem(key, user, data)
            .then(res => {
                    logger.info('Audit item inserted');
                }
            ).catch(error => {
                logger.error('Error during audit insertion ', error.stack);
            });
    },

    getEvents: async function(action, filters = {}) {

        const query = {
            text: `select * from audit where action = $1 and details @> $2`,
            values: [action, filters]
        };

        const {rows} = await db.query(query);
        return rows;
    }
};

function addItem(key, user, data) {
    const query = {
        text: `insert into audit ("user", action, details) values ($1, $2, $3);`,
        values: [user, key, data]
    };

    return db.query(query);
}
