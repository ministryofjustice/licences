const logger = require('../../log');
const db = require('./dataAccess/db');

const keys = [
    'LOGIN',
    'VIEW_CASELIST',
    'VIEW_TASKLIST',
    'LICENCE_RECORD_STARTED',
    'VIEW_SECTION',
    'UPDATE_SECTION',
    'REVIEW_SECTION',
    'SEND',
    'CREATE_PDF',
    'SEARCH_OFFENDERS',
    'VIEW_SEARCH_OFFENDERS_RESULT'
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
