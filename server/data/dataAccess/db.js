const logger = require('../../../log');
const config = require('../../config');

const {Pool} = require('pg');

const pool = new Pool({
    user: config.db.username,
    host: config.db.server,
    database: config.db.database,
    password: config.db.password,
    port: 5432
});

pool.on('error', (error, client) => {
    logger.error('Unexpected error on idle client', error);
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};

