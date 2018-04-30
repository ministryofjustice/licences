const logger = require('../../log');
const db = require('./dataAccess/db');

const keys = [
    'VIEW_TASKLIST',
    'VIEW_PRISONER_DETAILS',
    'VIEW_ADDRESS_DETAILS'
];

exports.record = function record(key, user, data) {

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
};

function addItem(key, user, data) {
    const query = {
        text: `insert into audit (user, action, details) 
                     VALUES ($1, $2, $3);`,
        values: [user, key, data]
    };

    return db.query(query);
}
