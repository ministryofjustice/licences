const logger = require('../../log');
const db = require('./dataAccess/db');

const keys = [
    'LOGIN',
    'LICENCE_RECORD_STARTED',
    'UPDATE_SECTION',
    'SEND',
    'CREATE_PDF'
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
        text: `insert into audit ("user", action, details) values ($1, $2, $3);`,
        values: [user, key, data]
    };

    return db.query(query);
}
