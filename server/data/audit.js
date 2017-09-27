const logger = require('../../log');
const db = require('./dataAccess/auditData');
const TYPES = require('tedious').TYPES;

const keys = ['VIEW_DASHBOARD'];

exports.record = function record(key, user, data) {

    if(!keys.includes(key)) {
        throw new Error(`Unknown audit key: ${key}`);
    }

    logger.audit('AUDIT', {key});

    return addItem(key, user, data)
        .then(id => {
            logger.info('Audit item inserted', id);
        })
        .catch(error => {
            logger.error('Error during audit insertion ', error);
        });
};

function addItem(key, user, data) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO AUDIT ([user], action, details)   
                     OUTPUT inserted.id  
                     VALUES (@user, @action, @details);`;

        const parameters = [
            {column: 'user', type: TYPES.VarChar, value: user},
            {column: 'action', type: TYPES.VarChar, value: key},
            {column: 'details', type: TYPES.VarChar, value: data ? JSON.stringify(data) : null}
        ];

        db.addRow(sql, parameters, resolve, reject);
    });
}

